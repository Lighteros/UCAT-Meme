(() => {
  const nav = document.getElementById("nav");
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  const logoFrame = document.getElementById("logo-frame");
  const canvas = document.getElementById("spark-field");
  const ctx = canvas.getContext("2d");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 12);
  });

  const sparks = Array.from({ length: 42 }, () => spawnSpark(true));
  let bolts = [];

  function spawnSpark(anywhere) {
    return {
      x: Math.random() * canvas.width,
      y: anywhere ? Math.random() * canvas.height : canvas.height + 8,
      r: 1.2 + Math.random() * 2.4,
      vx: -0.35 + Math.random() * 0.7,
      vy: -0.4 - Math.random() * 0.9,
      life: 80 + Math.random() * 140,
      hue: Math.random() > 0.45 ? "#f5c518" : "#ff9a1a",
    };
  }

  function spawnBolt() {
    const startX = 80 + Math.random() * (canvas.width - 160);
    const startY = 40 + Math.random() * 180;
    const points = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    const segs = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < segs; i += 1) {
      x += -28 + Math.random() * 56;
      y += 18 + Math.random() * 34;
      points.push({ x, y });
    }
    bolts.push({ points, life: 10 + Math.random() * 8 });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sparks.forEach((spark, i) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.life -= 1;
      ctx.globalAlpha = Math.max(spark.life / 160, 0.08);
      ctx.fillStyle = spark.hue;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
      ctx.fill();
      if (spark.life <= 0 || spark.y < -10) sparks[i] = spawnSpark(false);
    });

    bolts.forEach((bolt) => {
      ctx.globalAlpha = Math.min(bolt.life / 8, 0.85);
      ctx.strokeStyle = "#fff6e4";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#ffd34d";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      bolt.points.forEach((point, idx) => {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
      bolt.life -= 1;
    });
    bolts = bolts.filter((bolt) => bolt.life > 0);
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  if (!reduceMotion) {
    draw();
    setInterval(() => {
      if (document.hidden) return;
      if (Math.random() > 0.35) spawnBolt();
    }, 1600);
  }

  document.addEventListener("mousemove", (event) => {
    if (!logoFrame) return;
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    const shock = Math.hypot(event.clientX - midX, event.clientY - midY) < 240;
    logoFrame.classList.toggle("shocked", shock);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    },
    { threshold: 0.16 }
  );
  document.querySelectorAll(".rise").forEach((node) => observer.observe(node));
})();
