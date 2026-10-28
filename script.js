/* ==========================================================================
   PART 1: CONTENT (edit these)
   ========================================================================== */
const MENU = {
  Coffee: [
    { n: "Espresso", d: "Rich and short", p: "RM 7", i: "cup", c: "#3B1F12" },
    { n: "Latte", d: "Smooth with steamed milk", p: "RM 11", i: "cup", c: "#C8956B" },
    { n: "Cappuccino", d: "Foamy and balanced", p: "RM 11", i: "cup", c: "#A9744F" },
    { n: "Iced Kopi", d: "Local-style, over ice", p: "RM 9", i: "glass", c: "#8B5A3C", best: true },
  ],
  Pastries: [
    { n: "Butter croissant", d: "Baked this morning", p: "RM 8", i: "croissant", best: true },
    { n: "Cinnamon roll", d: "Warm with icing", p: "RM 9", i: "roll" },
    { n: "Banana loaf", d: "Moist, with walnuts", p: "RM 8", i: "loaf" },
    { n: "Cheese tart", d: "Crisp and creamy", p: "RM 9", i: "tart" },
  ],
  Cold: [
    { n: "Iced chocolate", d: "Dark and not too sweet", p: "RM 12", i: "glass", c: "#4A2A1C", best: true },
    { n: "Fresh lemon tea", d: "Light and zesty", p: "RM 8", i: "glass", c: "#F2C94C" },
    { n: "Cold brew", d: "Steeped for 18 hours", p: "RM 12", i: "glass", c: "#2B1810" },
    { n: "Sparkling water", d: "Plain or lime", p: "RM 6", i: "bottle" },
  ],
};

// Opening hours as [open, close] in 24h time, keyed by weekday (0 = Sunday).
const HOURS = { 0: [8, 16], 1: [7.5, 18], 2: [7.5, 18], 3: [7.5, 18], 4: [7.5, 18], 5: [7.5, 18], 6: [8, 20] };

// Order builder: choices shown as buttons. v = the word said at the counter ("" = nothing said).
const OPT = {
  drink: { label: "Drink", opts: [
    { v: "Kopi", g: "coffee" }, { v: "Teh", g: "tea" }, { v: "Milo", g: "chocolate malt" } ] },
  milk: { label: "Milk", opts: [
    { v: "", l: "Plain", g: "condensed milk" }, { v: "O", g: "no milk" }, { v: "C", g: "evaporated milk" } ] },
  sugar: { label: "Sugar", opts: [
    { v: "Kosong", g: "no sugar" }, { v: "Siew dai", g: "less sweet" }, { v: "", l: "Normal", g: "regular" }, { v: "Ga dai", g: "extra sweet" } ] },
  strength: { label: "Strength", opts: [
    { v: "Po", g: "light" }, { v: "", l: "Normal", g: "regular" }, { v: "Gao", g: "strong" } ] },
  temp: { label: "Temperature", opts: [
    { v: "", l: "Panas", g: "hot" }, { v: "Peng", g: "iced" } ] },
};
const START = { drink: "Kopi", milk: "C", sugar: "Siew dai", strength: "", temp: "Peng" };
const PRICE = { Kopi: 7, Teh: 7, Milo: 9 }; // hot price; Peng +RM 2, Gao +RM 1

/* ==========================================================================
   PART 2: PAGE CODE
   ========================================================================== */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);

// ---------- colour helpers ----------
const hex2 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a) => "#" + a.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = hex2(a), B = hex2(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const ramp = (stops, p) => {
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i][0]) { const [p0, c0] = stops[i - 1], [p1, c1] = stops[i]; return mix(c0, c1, (p - p0) / (p1 - p0 || 1)); }
  }
  return stops[stops.length - 1][1];
};

// ---------- Menu board ----------
const ICONS = {
  cup: (c) => `<svg viewBox="0 0 64 64"><ellipse cx="32" cy="52" rx="22" ry="4" fill="#2B1710" opacity=".2"/><path d="M12 24h34v10a15 15 0 0 1-15 15h-4a15 15 0 0 1-15-15z" fill="#fff" stroke="#2B1710" stroke-width="3"/><path d="M15 26h28v7a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" fill="${c}"/><path d="M46 28h3a6 6 0 0 1 0 12h-5" fill="none" stroke="#2B1710" stroke-width="3"/><path d="M24 18c-3-4 3-6 0-10M33 18c-3-4 3-6 0-10" fill="none" stroke="#2B1710" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  glass: (c) => `<svg viewBox="0 0 64 64"><path d="M16 16h32l-4 38a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z" fill="#fff" stroke="#2B1710" stroke-width="3"/><path d="M19 27h26l-2.6 26H21.6z" fill="${c}"/><rect x="24" y="30" width="10" height="10" rx="2" fill="#fff" opacity=".6" transform="rotate(-12 29 35)"/><rect x="33" y="40" width="9" height="9" rx="2" fill="#fff" opacity=".6" transform="rotate(10 37 44)"/><path d="M40 4l-6 24" stroke="#C8281E" stroke-width="4" stroke-linecap="round"/></svg>`,
  croissant: () => `<svg viewBox="0 0 64 64"><path d="M5 42c2-18 12-26 27-26s25 8 27 26c-6-6-11-7-16-3-3-5-8-5-11 0-3-5-8-5-11 0-5-4-10-3-16 3z" fill="#E7A94A" stroke="#2B1710" stroke-width="3" stroke-linejoin="round"/><path d="M22 20l4 18M32 17v20M42 20l-4 18" stroke="#B9722A" stroke-width="3" stroke-linecap="round"/></svg>`,
  roll: () => `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#D9985A" stroke="#2B1710" stroke-width="3"/><path d="M32 32m0 0a4 4 0 1 1 5 4 9 9 0 1 1-12-8 14 14 0 1 1 18 4" fill="none" stroke="#8A4E22" stroke-width="3.5" stroke-linecap="round"/><path d="M14 26c6 0 8-6 18-6s12 6 18 6c0 6-4 5-6 8s-4 2-6 0-4 2-6 0-4 2-6 0-6 2-8-2-4-2-4-6z" fill="#fff" opacity=".85"/></svg>`,
  loaf: () => `<svg viewBox="0 0 64 64"><path d="M8 28c0-10 10-14 24-14s24 4 24 14v20a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#C98B4F" stroke="#2B1710" stroke-width="3"/><path d="M14 30c4-6 12-8 18-8s14 2 18 8v6H14z" fill="#E4B073"/><path d="M26 24v28M38 24v28" stroke="#8A5A2B" stroke-width="2.5" opacity=".5"/><circle cx="20" cy="44" r="2" fill="#6B3E26"/><circle cx="44" cy="42" r="2" fill="#6B3E26"/><circle cx="32" cy="46" r="2" fill="#6B3E26"/></svg>`,
  tart: () => `<svg viewBox="0 0 64 64"><path d="M8 34h48l-5 18a3 3 0 0 1-3 2H16a3 3 0 0 1-3-2z" fill="#E4B073" stroke="#2B1710" stroke-width="3" stroke-linejoin="round"/><ellipse cx="32" cy="34" rx="24" ry="10" fill="#F6C453" stroke="#2B1710" stroke-width="3"/><ellipse cx="32" cy="33" rx="12" ry="4" fill="#FFE59A"/></svg>`,
  bottle: () => `<svg viewBox="0 0 64 64"><path d="M27 6h10v8l5 8v32a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3V22l5-8z" fill="#CFEBF5" stroke="#2B1710" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="30" width="20" height="14" fill="#2E9E5B"/><circle cx="29" cy="22" r="1.8" fill="#fff"/><circle cx="35" cy="26" r="1.8" fill="#fff"/><circle cx="31" cy="50" r="1.8" fill="#fff"/></svg>`,
};
const thumb = (m) => `<div class="thumb">${m.img ? `<img src="${m.img}" alt="" loading="lazy">` : ICONS[m.i](m.c)}</div>`;

$("board").innerHTML = Object.entries(MENU).map(([cat, list]) =>
  `<div class="col"><h3>${cat}</h3><ul>${list.map((m) =>
    `<li>${thumb(m)}<span><b>${m.best ? '<i class="best">Best seller</i>' : ""}${m.n}</b><small>${m.d}</small></span><b>${m.p}</b></li>`).join("")}</ul></div>`).join("");

// ticket-rail icons
document.querySelectorAll(".ico[data-i]").forEach((el) => { el.innerHTML = ICONS[el.dataset.i](el.dataset.c); });

// ---------- Order builder ----------
const form0 = $("builder");
$("groups").innerHTML = Object.entries(OPT).map(([key, g]) =>
  `<fieldset><legend>${g.label}</legend><div class="opts">${g.opts.map((o) =>
    `<label class="opt"><input type="radio" name="${key}" value="${o.v}"${START[key] === o.v ? " checked" : ""}><span><b>${o.l || o.v}</b><small>${o.g}</small></span></label>`).join("")}</div></fieldset>`).join("");

const BASE_COL = { Kopi: "#2A1409", Teh: "#9A5A24", Milo: "#6B4430" };
const MILK_AMT = { "": 0.38, O: 0, C: 0.24 };
const lingo = $("lingo"), plain = $("plain"), priceEl = $("price"), note = $("note"), cup = $("cup");
$("orderNo").textContent = "Order no. " + (10 + Math.floor(Math.random() * 80));

const getState = () => { const s = {}; Object.keys(OPT).forEach((k) => (s[k] = form0.elements[k].value)); return s; };

function say(s) { return [s.drink, s.milk, s.sugar, s.strength, s.temp].filter(Boolean).join(" ").toUpperCase(); }
function describe(s) {
  const base = { Kopi: "Coffee", Teh: "Tea", Milo: "Milo" }[s.drink];
  const milk = { "": "with condensed milk", O: "with no milk", C: "with evaporated milk" }[s.milk];
  const sugar = { Kosong: "no sugar", "Siew dai": "less sweet", "": "regular sweetness", "Ga dai": "extra sweet" }[s.sugar];
  const str = { Po: "light", "": "", Gao: "strong" }[s.strength];
  const temp = s.temp === "Peng" ? "over ice" : "hot";
  return `${base} ${milk}, ${[sugar, str, temp].filter(Boolean).join(", ")}.`;
}
function render() {
  const s = getState();
  lingo.textContent = say(s);
  plain.textContent = describe(s);
  const p = PRICE[s.drink] + (s.temp === "Peng" ? 2 : 0) + (s.strength === "Gao" ? 1 : 0);
  priceEl.textContent = "RM " + p.toFixed(2);
  let c = mix(BASE_COL[s.drink], "#E9CBA3", MILK_AMT[s.milk]);
  if (s.strength === "Po") c = mix(c, "#E9CBA3", 0.16);
  if (s.strength === "Gao") c = mix(c, "#120804", 0.25);
  $("liquid").setAttribute("fill", c);
  cup.classList.toggle("iced", s.temp === "Peng");
}
form0.addEventListener("change", () => {
  render();
  note.textContent = "";
  if (!reduce) lingo.animate([{ transform: "scale(1.04)" }, { transform: "none" }], { duration: 180 });
});
$("surprise").addEventListener("click", () => {
  Object.entries(OPT).forEach(([k, g]) => {
    const pick = g.opts[Math.floor(Math.random() * g.opts.length)].v;
    [...form0.elements[k]].forEach((r) => (r.checked = r.value === pick));
  });
  render(); note.textContent = "";
});
$("copy").addEventListener("click", async () => {
  const text = `${lingo.textContent} (${priceEl.textContent})`;
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
    try {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); ta.remove();
    } catch (e2) {}
  }
  note.textContent = ok ? "Copied. Say it at the counter." : "Couldn't copy. Select the order above and copy it.";
});

// ---------- Reservation form (demo: nothing is sent) ----------
const form = $("form"), msg = $("msg");
const f = form.elements;
f.date.min = new Date().toISOString().split("T")[0];
$("addBooking").addEventListener("click", () => {
  f.order.value = `${lingo.textContent} (${priceEl.textContent})`;
  note.innerHTML = 'Added to your table request. <a href="#contact">Go to the form</a>';
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  [f.name, f.email, f.date].forEach((el) => {
    const bad = !el.value.trim() || !el.checkValidity();
    el.classList.toggle("bad", bad);
    if (bad) ok = false;
  });
  msg.className = "msg " + (ok ? "ok" : "err");
  msg.textContent = ok
    ? `Thanks ${f.name.value.trim()}! We'll confirm your table for ${f.guests.value} on ${f.date.value}.${f.order.value.trim() ? " First order noted: " + f.order.value.trim() + "." : ""}`
    : "Please fill in your name, a valid email and a date.";
  if (ok) form.reset();
});

// ---------- Open / closed door sign + today's hours ----------
const fmt = (h) => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh >= 12 ? "pm" : "am"}`;
};
const now = new Date();
const [from, to] = HOURS[now.getDay()];
const tNow = now.getHours() + now.getMinutes() / 60;
const isOpen = tNow >= from && tNow < to;
const door = $("door");
door.className = "door " + (isOpen ? "open" : "closed");
$("doorWord").textContent = isOpen ? "Open" : "Closed";
if (isOpen) {
  $("doorSub").textContent = "Until " + fmt(to);
} else {
  let label = "";
  if (tNow < from) label = "Opens " + fmt(from);
  else {
    const nd = (now.getDay() + 1) % 7;
    label = "Opens tomorrow " + fmt(HOURS[nd][0]);
  }
  $("doorSub").textContent = label;
}
document.querySelectorAll("#hours div").forEach((row) => {
  if (row.dataset.d.split(",").includes(String(now.getDay()))) row.classList.add("today");
});

// ---------- A day at the café: scroll drives background + clock ----------
const root = document.documentElement;
const SKY_LIGHT = [[0, "#f3ddc4"], [0.2, "#e9eee6"], [0.5, "#e4eee1"], [0.75, "#f4e3bd"], [1, "#e8cfc6"]];
const SKY_DARK = [[0, "#2a1d17"], [0.2, "#1a1512"], [0.5, "#14201d"], [0.75, "#2a1f14"], [1, "#1a1320"]];
const SUN = [[0, "#f08a3c"], [0.35, "#f6c73f"], [0.65, "#f2a93a"], [0.9, "#e4572e"], [1, "#e4572e"]];
const darkMQ = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => root.dataset.theme === "dark" || (root.dataset.theme !== "light" && darkMQ.matches);
const themeMeta = document.querySelector('meta[name="theme-color"]');
const clockTime = $("clockTime"), sunDot = $("sunDot"), sunRays = $("sunRays"), moon = $("moonIcon");
let ticking = false;

function paintDay() {
  ticking = false;
  const max = root.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  const sky = ramp(isDark() ? SKY_DARK : SKY_LIGHT, p);
  root.style.setProperty("--marble", sky);
  if (themeMeta) themeMeta.setAttribute("content", sky);
  const h = 7.5 + p * 12.5;
  clockTime.textContent = fmt(Math.round(h * 4) / 4);
  const night = h >= 18.75;
  const col = ramp(SUN, p);
  sunDot.setAttribute("fill", col); sunRays.setAttribute("stroke", col);
  $("sunIcon").style.display = night ? "none" : "";
  moon.hidden = !night;
  quick.classList.toggle("show", scrollY > 400);
}
const quick = $("quick");
const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(paintDay); } };
addEventListener("scroll", schedule, { passive: true });
addEventListener("resize", schedule);
darkMQ.addEventListener("change", schedule);
paintDay();

// ---------- Testimonials carousel ----------
const track = $("track"), dots = $("dots");
let timer;
const step = () => track.children[0].offsetWidth + parseFloat(getComputedStyle(track).columnGap || 24);
const pages = () => Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1);
const goTo = (i) => track.scrollTo({ left: i * step(), behavior: reduce ? "auto" : "smooth" });
function buildDots() {
  dots.innerHTML = "<i></i>".repeat(pages());
  [...dots.children].forEach((d, i) => d.addEventListener("click", () => { goTo(i); restart(); }));
  markDot();
}
function markDot() {
  const i = Math.min(pages() - 1, Math.round(track.scrollLeft / step()));
  [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
}
function move(dir) {
  const i = Math.round(track.scrollLeft / step()) + dir;
  goTo(i < 0 ? pages() - 1 : i >= pages() ? 0 : i);
}
function restart() { clearInterval(timer); if (!reduce) timer = setInterval(() => move(1), 5000); }
$("prev").addEventListener("click", () => { move(-1); restart(); });
$("next").addEventListener("click", () => { move(1); restart(); });
track.addEventListener("scroll", markDot, { passive: true });
track.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") move(1); if (e.key === "ArrowLeft") move(-1); });
["mouseenter", "focusin", "touchstart"].forEach((ev) => track.parentElement.addEventListener(ev, () => clearInterval(timer), { passive: true }));
["mouseleave", "focusout"].forEach((ev) => track.parentElement.addEventListener(ev, restart));
addEventListener("resize", buildDots);
buildDots(); restart();

// ---------- Navigation: highlight the section in view ----------
const navLinks = [...document.querySelectorAll("#links a")];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => {
      const on = a.getAttribute("href") === "#" + en.target.id;
      a.classList.toggle("active", on);
      on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

// ---------- Mobile menu ----------
const burger = $("burger"), links = $("links");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => {
  if (e.target.tagName === "A") { links.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
});

// ---------- Init ----------
render();
$("year").textContent = new Date().getFullYear();
