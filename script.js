(function () {
  const body = document.body;
  const seal = document.getElementById("seal");
  const cover = document.getElementById("cover");
  const details = document.getElementById("details");
  const closeBtn = document.getElementById("close");
  const inside = document.querySelector(".inside");
  const petals = document.querySelector(".petals");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Personalised greeting: share the link as ...?to=Guest%20Name
  const guest = new URLSearchParams(location.search).get("to");
  if (guest) {
    document.getElementById("greeting").textContent = "Dear " + guest.trim().slice(0, 60) + ",";
  }

  function open() {
    if (body.classList.contains("opened")) return;
    body.classList.add("opened");
    if (navigator.vibrate) navigator.vibrate(30);
    showPetals();
    setTimeout(function () {
      details.hidden = false;
      setTimeout(function () {
        details.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }, 1400);
    }, reduceMotion ? 0 : 1200);
  }

  function close() {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(function () {
      details.hidden = true;
      body.classList.remove("opened");
    }, 500);
  }

  seal.addEventListener("click", open);
  cover.addEventListener("click", open);
  closeBtn.addEventListener("click", close);

  // Tap the opened invitation to read it full screen
  inside.addEventListener("click", function () {
    if (!body.classList.contains("opened")) return;
    const zoom = document.createElement("div");
    zoom.className = "zoom";
    zoom.innerHTML = '<img src="images/inside.jpg" alt="">';
    zoom.querySelector("img").alt = inside.alt;
    zoom.addEventListener("click", function () { zoom.remove(); });
    document.body.appendChild(zoom);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".zoom").forEach(function (z) { z.remove(); });
  });

  function showPetals() {
    if (reduceMotion) return;
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      const duration = 5 + Math.random() * 5;
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = duration + "s";
      p.style.animationDelay = Math.random() * 2.5 + "s";
      p.style.setProperty("--drift", (Math.random() * 30 - 15) + "vw");
      p.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
      p.style.transform = "scale(" + (0.6 + Math.random() * 0.8) + ")";
      petals.appendChild(p);
      setTimeout(function () { p.remove(); }, (duration + 3) * 1000);
    }
  }

  // Countdown to Friday 01 January 2027, 7:00 pm Dhaka time (UTC+6)
  const target = new Date("2027-01-01T19:00:00+06:00").getTime();
  const els = ["days", "hours", "mins", "secs"].map(function (k) {
    return document.getElementById("cd-" + k);
  });

  function tick() {
    let diff = Math.max(0, target - Date.now());
    if (diff === 0) {
      document.getElementById("countdown").outerHTML =
        '<p class="date" style="margin:1.8rem 0">Alhamdulillah, the day is here!</p>';
      return;
    }
    const s = Math.floor(diff / 1000);
    const values = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    els.forEach(function (el, i) { el.textContent = values[i]; });
    setTimeout(tick, 1000);
  }
  tick();
})();
