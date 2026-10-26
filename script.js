(function () {
  const body = document.body;
  const seal = document.getElementById("seal");
  const cover = document.getElementById("cover");
  const details = document.getElementById("details");
  const closeBtn = document.getElementById("close");
  const inside = document.querySelector(".inside");
  const card = document.getElementById("card");
  const canvas = document.getElementById("fireworks");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Personalised greeting: share the link as ...?to=Guest%20Name
  const guest = new URLSearchParams(location.search).get("to");
  if (guest) {
    document.getElementById("greeting").textContent = "Dear " + guest.trim().slice(0, 60) + ",";
  }

  function open() {
    if (body.classList.contains("opened")) return;
    fitOpenCard();
    body.classList.add("opened");
    if (navigator.vibrate) navigator.vibrate(30);
    showFireworks();
    // Show the details once the card is open, but stay on the card for 5 seconds
    setTimeout(function () {
      details.hidden = false;
    }, reduceMotion ? 0 : 1900);
    setTimeout(function () {
      if (!body.classList.contains("opened")) return;
      details.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }, reduceMotion ? 5000 : 7000);
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
    const copy = inside.cloneNode(true);
    copy.removeAttribute("id");
    copy.removeAttribute("aria-labelledby");
    copy.setAttribute("aria-label", inside.querySelector("title").textContent);
    copy.querySelector("title").removeAttribute("id");
    zoom.appendChild(copy);
    zoom.addEventListener("click", function () { zoom.remove(); });
    document.body.appendChild(zoom);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll(".zoom").forEach(function (z) { z.remove(); });
  });

  // Opened, the flap and right panel stick out on both sides (about 2.12x the
  // card's width). Where that doesn't fit, they fade away after swinging open
  // so the invitation keeps its full size.
  function fitOpenCard() {
    body.classList.toggle("compact", window.innerWidth - 24 < card.offsetWidth * 2.12);
  }
  window.addEventListener("resize", fitOpenCard);

  function showFireworks() {
    if (reduceMotion) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#f3dcaa", "#e6c58a", "#fff3dc", "#ff8fb1", "#ff4d79", "#ffd36e"];
    const rockets = [];
    const sparks = [];
    const start = performance.now();
    let launched = 0;
    const total = 14;

    function launch() {
      rockets.push({
        x: w * (0.15 + Math.random() * 0.7),
        y: h,
        vy: -(h * 0.012 + Math.random() * h * 0.004),
        peak: h * (0.12 + Math.random() * 0.3),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
      launched++;
    }

    function burst(r) {
      const count = 70 + Math.floor(Math.random() * 40);
      const speed = 2.2 + Math.random() * 2;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        const v = speed * (0.6 + Math.random() * 0.4);
        sparks.push({
          x: r.x, y: r.y,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 1, decay: 0.010 + Math.random() * 0.012,
          color: Math.random() < 0.25 ? "#fff3dc" : r.color
        });
      }
    }

    function frame(now) {
      const t = now - start;
      if (launched < total && t > launched * 280) launch();

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, .22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.color;
        ctx.fillRect(r.x - 1, r.y, 2, 6);
        if (r.y <= r.peak || r.vy > -1.5) { burst(r); rockets.splice(i, 1); }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.vx *= 0.98;
        p.vy = p.vy * 0.98 + 0.045;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (launched < total || rockets.length || sparks.length) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }
    requestAnimationFrame(frame);
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
