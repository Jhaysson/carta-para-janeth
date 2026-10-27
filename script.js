(function () {
  "use strict";

  const pageEls = Array.from(document.querySelectorAll(".page"));
  const lastIndex = pageEls.length - 1;
  const interiorCount = lastIndex - 1;

  const book = document.getElementById("book");
  const openBtn = document.getElementById("openBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const controls = document.getElementById("controls");
  const progress = document.getElementById("progress");
  const pageCount = document.getElementById("pageCount");
  const hint = document.getElementById("hint");
  const status = document.getElementById("status");
  const turnShadow = document.getElementById("turnShadow");
  const heartButton = document.getElementById("heartButton");
  const restartButtons = Array.from(document.querySelectorAll('[data-action="restart"]'));

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionQuery.matches;
  let current = 0;
  let animating = false;
  let hintTimer = null;
  let hintDismissed = false;

  const progressHearts = [];
  const scrollCues = new Map();

  for (let i = 1; i <= interiorCount; i += 1) {
    const heart = document.createElement("span");
    heart.className = "progress__heart";
    heart.textContent = "♥";
    progress.appendChild(heart);
    progressHearts.push(heart);
  }

  function updateUI() {
    const isCover = current === 0;
    const isBack = current === lastIndex;
    const isInterior = !isCover && !isBack;

    document.body.classList.toggle("is-cover", isCover);
    document.body.classList.toggle("is-back", isBack);

    prevBtn.disabled = isCover;
    nextBtn.disabled = isCover || isBack;

    controls.inert = isCover;
    controls.setAttribute("aria-hidden", isCover ? "true" : "false");

    if (isCover) {
      pageCount.textContent = "";
    } else if (isBack) {
      pageCount.textContent = "Fin";
    } else {
      pageCount.textContent =
        String(current).padStart(2, "0") +
        " / " +
        String(interiorCount).padStart(2, "0");
    }

    progressHearts.forEach(function (heart, index) {
      const pageNumber = index + 1;
      const filled = isBack || (isInterior && pageNumber <= current);
      const active = isInterior && pageNumber === current;

      heart.classList.toggle("is-filled", filled);
      heart.classList.toggle("is-current", active);
    });

    if (current === 1 && !hintDismissed) {
      hint.classList.remove("is-hidden");
      window.clearTimeout(hintTimer);
      hintTimer = window.setTimeout(function () {
        hint.classList.add("is-hidden");
        hintDismissed = true;
      }, 6500);
    } else if (current > 1) {
      hint.classList.add("is-hidden");
      hintDismissed = true;
      window.clearTimeout(hintTimer);
    }
  }

  function syncAccessibility() {
    pageEls.forEach(function (page, index) {
      const active = index === current;

      if (active) {
        page.removeAttribute("aria-hidden");
        page.removeAttribute("inert");
      } else {
        page.setAttribute("aria-hidden", "true");
        page.setAttribute("inert", "");
      }
    });
  }

  function announcePage() {
    if (current === 0) {
      status.textContent = "Portada del folleto. Pulsa Abrir para comenzar.";
    } else if (current === lastIndex) {
      status.textContent = "Final del folleto. Gracias por leer.";
    } else {
      status.textContent = "Página " + current + " de " + interiorCount + ".";
    }
  }

  function updateScrollCue(content) {
    const cue = scrollCues.get(content);

    if (!cue) {
      return;
    }

    const overflow = content.scrollHeight - content.clientHeight;
    const atBottom =
      content.scrollTop + content.clientHeight >= content.scrollHeight - 6;
    const show = overflow > 4 && !atBottom;

    content.classList.toggle("has-overflow", show);
    cue.classList.toggle("is-visible", show);
  }

  function updateScrollCues() {
    scrollCues.forEach(function (cue, content) {
      updateScrollCue(content);
    });
  }

  function setupScrollCues() {
    pageEls.forEach(function (page) {
      const inner = page.querySelector(".page__inner");
      const content = page.querySelector(".page__content");

      if (!inner || !content) {
        return;
      }

      const cue = document.createElement("div");
      cue.className = "page__scroll-cue";
      cue.setAttribute("aria-hidden", "true");
      cue.innerHTML = "<span>Desliza</span><i aria-hidden=\"true\">↓</i>";
      inner.appendChild(cue);
      scrollCues.set(content, cue);

      content.addEventListener(
        "scroll",
        function () {
          updateScrollCue(content);
        },
        { passive: true }
      );
    });
  }

  function resetActiveScroll() {
    const active = pageEls[current];
    const content = active ? active.querySelector(".page__content") : null;

    if (!content) {
      return;
    }

    content.scrollTop = 0;
    updateScrollCue(content);
  }

  function finishNavigation() {
    animating = false;
    updateUI();
    syncAccessibility();
    announcePage();
    resetActiveScroll();
    updateScrollCues();
  }

  function goTo(index) {
    if (animating || index === current || index < 0 || index > lastIndex) {
      return;
    }

    const from = current;
    const forward = index > from;
    const outPage = pageEls[from];
    const inPage = pageEls[index];
    const inContent = inPage.querySelector(".page__content");
    const duration = reduceMotion ? 0 : 780;
    const easing = "cubic-bezier(0.22, 0.75, 0.2, 1)";

    if (inContent) {
      inContent.scrollTop = 0;
      updateScrollCue(inContent);
    }

    animating = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    hint.classList.add("is-hidden");

    if (reduceMotion || typeof inPage.animate !== "function") {
      outPage.classList.remove("is-active", "is-under", "is-incoming", "is-turning");
      inPage.classList.remove("is-under", "is-incoming", "is-turning");
      inPage.classList.add("is-active");
      outPage.style.transform = "";
      inPage.style.transform = "";
      current = index;
      finishNavigation();
      return;
    }

    turnShadow.classList.remove("is-active");
    void turnShadow.offsetWidth;
    turnShadow.classList.add("is-active");
    spawnTurnSparkle();

    if (forward) {
      inPage.classList.add("is-under");
      outPage.classList.add("is-turning");

      const animation = outPage.animate(
        [
          { transform: "rotateY(0deg)" },
          { transform: "rotateY(-92deg)" }
        ],
        {
          duration: duration,
          easing: easing,
          fill: "forwards"
        }
      );

      animation.finished
        .then(function () {
          animation.cancel();
          outPage.classList.remove("is-active", "is-turning");
          outPage.style.transform = "";
          inPage.classList.remove("is-under");
          inPage.classList.add("is-active");
          current = index;
          finishNavigation();
        })
        .catch(function () {
          outPage.classList.remove("is-active", "is-turning");
          outPage.style.transform = "";
          inPage.classList.remove("is-under");
          inPage.classList.add("is-active");
          current = index;
          finishNavigation();
        });
    } else {
      inPage.classList.remove("is-active", "is-under");
      inPage.classList.add("is-incoming");
      inPage.style.transform = "rotateY(-92deg)";
      void inPage.offsetWidth;

      const animation = inPage.animate(
        [
          { transform: "rotateY(-92deg)" },
          { transform: "rotateY(0deg)" }
        ],
        {
          duration: duration,
          easing: easing,
          fill: "forwards"
        }
      );

      animation.finished
        .then(function () {
          animation.cancel();
          inPage.style.transform = "";
          inPage.classList.remove("is-incoming");
          inPage.classList.add("is-active");
          outPage.classList.remove("is-active");
          current = index;
          finishNavigation();
        })
        .catch(function () {
          inPage.style.transform = "";
          inPage.classList.remove("is-incoming");
          inPage.classList.add("is-active");
          outPage.classList.remove("is-active");
          current = index;
          finishNavigation();
        });
    }

    window.setTimeout(function () {
      turnShadow.classList.remove("is-active");
    }, duration + 120);
  }

  openBtn.addEventListener("click", function () {
    if (current !== 0) {
      return;
    }

    burstAtBook(22);
    goTo(1);
  });

  prevBtn.addEventListener("click", function () {
    goTo(current - 1);
  });

  nextBtn.addEventListener("click", function () {
    goTo(current + 1);
  });

  restartButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      goTo(0);
    });
  });

  heartButton.addEventListener("click", function () {
    const rect = heartButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (navigator.vibrate) {
      try {
        navigator.vibrate(28);
      } catch (error) {
        void error;
      }
    }

    if (!reduceMotion) {
      spawnBurst(centerX, centerY, 24);
      heartRain(56);
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchActive = false;
  let touchAxis = null;

  book.addEventListener(
    "touchstart",
    function (event) {
      if (event.touches.length !== 1 || animating) {
        return;
      }

      if (event.target.closest("button, a")) {
        return;
      }

      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = performance.now();
      touchActive = true;
      touchAxis = null;
    },
    { passive: true }
  );

  book.addEventListener(
    "touchmove",
    function (event) {
      if (!touchActive || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (!touchAxis && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        touchAxis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";
      }
    },
    { passive: true }
  );

  book.addEventListener(
    "touchend",
    function (event) {
      if (!touchActive) {
        return;
      }

      touchActive = false;

      if (touchAxis !== "x" || !event.changedTouches.length) {
        return;
      }

      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const elapsed = performance.now() - touchStartTime;

      if (
        elapsed < 900 &&
        Math.abs(dx) > 42 &&
        Math.abs(dx) > Math.abs(dy) * 1.2
      ) {
        if (dx < 0) {
          goTo(current + 1);
        } else {
          goTo(current - 1);
        }
      }
    },
    { passive: true }
  );

  book.addEventListener(
    "touchcancel",
    function () {
      touchActive = false;
      touchAxis = null;
    },
    { passive: true }
  );

  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      goTo(current + 1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      goTo(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(lastIndex);
    }
  });

  const canvas = document.getElementById("hearts-canvas");
  const ctx = canvas.getContext("2d");
  const colors = [
    [201, 162, 75],
    [183, 110, 121],
    [216, 167, 173],
    [247, 233, 231]
  ];

  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1;
  let ambientHearts = [];
  let flyingHearts = [];
  let elapsed = 0;
  let lastFrame = 0;
  let frameId = null;
  let running = false;
  let resizeTimer = null;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function heartPath(x, y, size) {
    const top = size * 0.3;

    ctx.beginPath();
    ctx.moveTo(x, y + top);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + top);
    ctx.bezierCurveTo(
      x - size / 2,
      y + (size + top) / 2,
      x,
      y + (size + top) / 1.5,
      x,
      y + size
    );
    ctx.bezierCurveTo(
      x,
      y + (size + top) / 1.5,
      x + size / 2,
      y + (size + top) / 2,
      x + size / 2,
      y + top
    );
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + top);
    ctx.closePath();
  }

  function makeAmbientHeart(initial) {
    const size = random(6, canvasWidth < 620 ? 14 : 18);

    return {
      x: random(0, canvasWidth),
      y: initial ? random(0, canvasHeight) : canvasHeight + size * 2,
      size: size,
      speed: random(5, 16),
      drift: random(5, 15),
      phase: random(0.35, 1.3),
      offset: random(0, Math.PI * 2),
      rot: random(-0.55, 0.55),
      rotSpeed: random(-0.12, 0.12),
      alpha: random(0.07, 0.22),
      color: randomColor(),
      glow: Math.random() < 0.22
    };
  }

  function buildAmbientHearts() {
    const count =
      canvasWidth < 620 ? 14 : canvasWidth < 1080 ? 20 : 26;

    ambientHearts = [];

    for (let i = 0; i < count; i += 1) {
      ambientHearts.push(makeAmbientHeart(true));
    }
  }

  function drawHeart(heart, alpha) {
    const color = heart.color;

    ctx.save();
    ctx.translate(heart.x, heart.y);
    ctx.rotate(heart.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle =
      "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";

    if (heart.glow) {
      ctx.shadowBlur = heart.size * 0.9;
      ctx.shadowColor =
        "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", 0.6)";
    }

    heartPath(0, -heart.size * 0.45, heart.size);
    ctx.fill();
    ctx.restore();
  }

  function drawAmbient() {
    ambientHearts.forEach(function (heart) {
      drawHeart(heart, heart.alpha);
    });
  }

  function updateAmbient(dt) {
    ambientHearts.forEach(function (heart) {
      heart.y -= heart.speed * dt;
      heart.x +=
        Math.sin(elapsed * heart.phase + heart.offset) *
        heart.drift *
        dt;
      heart.rot += heart.rotSpeed * dt;

      if (heart.y < -heart.size * 2.5) {
        heart.y = canvasHeight + heart.size * 2;
        heart.x = random(0, canvasWidth);
        heart.alpha = random(0.07, 0.22);
      }

      if (heart.x < -50) {
        heart.x = canvasWidth + 40;
      } else if (heart.x > canvasWidth + 50) {
        heart.x = -40;
      }
    });
  }

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = random(0, Math.PI * 2);
      const speed = random(65, 270);
      const life = random(1.2, 2.3);

      flyingHearts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        size: random(5, 14),
        rot: random(-1, 1),
        rotSpeed: random(-3.5, 3.5),
        life: life,
        maxLife: life,
        gravity: random(150, 260),
        drag: random(1.1, 2.2),
        color: randomColor(),
        glow: Math.random() < 0.4
      });
    }
  }

  function heartRain(count) {
    for (let i = 0; i < count; i += 1) {
      const life = random(3.4, 6);

      flyingHearts.push({
        x: random(0, canvasWidth),
        y: random(-canvasHeight * 0.35, -20),
        vx: random(-18, 18),
        vy: random(45, 120),
        size: random(6, 17),
        rot: random(-1, 1),
        rotSpeed: random(-1.8, 1.8),
        life: life,
        maxLife: life,
        gravity: random(10, 26),
        drag: random(0.02, 0.14),
        color: randomColor(),
        glow: Math.random() < 0.3
      });
    }
  }

  function updateFlying(dt) {
    flyingHearts = flyingHearts.filter(function (heart) {
      heart.life -= dt;

      if (heart.life <= 0) {
        return false;
      }

      heart.vy += heart.gravity * dt;
      heart.vx *= Math.max(0, 1 - heart.drag * dt);
      heart.vy *= Math.max(0, 1 - heart.drag * dt * 0.32);
      heart.x += heart.vx * dt;
      heart.y += heart.vy * dt;
      heart.rot += heart.rotSpeed * dt;

      return true;
    });
  }

  function drawFlying() {
    flyingHearts.forEach(function (heart) {
      const fade = Math.min(1, heart.life / 0.7);
      const alpha = fade * 0.78;
      drawHeart(heart, alpha);
    });
  }

  function burstAtBook(count) {
    if (reduceMotion) {
      return;
    }

    const rect = book.getBoundingClientRect();

    spawnBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height * 0.46,
      count
    );
  }

  function spawnTurnSparkle() {
    if (reduceMotion) {
      return;
    }

    const rect = book.getBoundingClientRect();
    const x = rect.left + 26;
    const y = rect.top + rect.height * random(0.26, 0.74);

    spawnBurst(x, y, 5);
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildAmbientHearts();

    if (reduceMotion) {
      drawStatic();
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  function drawStatic() {
    clearCanvas();
    drawAmbient();
  }

  function frame(now) {
    if (!running) {
      return;
    }

    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    elapsed += dt;

    clearCanvas();
    updateAmbient(dt);
    updateFlying(dt);
    drawAmbient();
    drawFlying();

    frameId = window.requestAnimationFrame(frame);
  }

  function startCanvas() {
    if (reduceMotion) {
      drawStatic();
      return;
    }

    if (running) {
      return;
    }

    running = true;
    lastFrame = performance.now();
    frameId = window.requestAnimationFrame(frame);
  }

  function stopCanvas() {
    running = false;

    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  motionQuery.addEventListener("change", function (event) {
    reduceMotion = event.matches;

    if (reduceMotion) {
      stopCanvas();
      flyingHearts = [];
      drawStatic();
    } else {
      startCanvas();
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopCanvas();
    } else if (!reduceMotion) {
      startCanvas();
    }
  });

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      resizeCanvas();
      updateScrollCues();
      if (!reduceMotion) {
        startCanvas();
      }
    }, 140);
  });

  setupScrollCues();
  updateUI();
  syncAccessibility();
  announcePage();
  resizeCanvas();
  startCanvas();
  updateScrollCues();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      updateScrollCues();
    });
  }

  window.addEventListener("load", updateScrollCues);
})();
