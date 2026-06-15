/* =========================================================
   Bob Bice — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme toggle ---------- */
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("bb-theme", next); } catch (e) {}
    });
  }

  /* ---------- nav shadow on scroll ---------- */
  var nav = document.querySelector(".nav");
  var onScroll = function () {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu (hamburger) ---------- */
  var navToggle = document.getElementById("navToggle");
  if (navToggle && nav) {
    var closeMenu = function () {
      nav.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("menu-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll("#navLinks a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- stat count-ups ---------- */
  var counted = false;
  function runCounts() {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".stat-num[data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var start = performance.now();
      var dur = 1100;
      function frame(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }
  var heroStats = document.querySelector(".hero-stats");
  if (heroStats && "IntersectionObserver" in window && !reduceMotion) {
    var sObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounts(); sObs.disconnect(); } });
    }, { threshold: 0.4 });
    sObs.observe(heroStats);
    // safety net if observer never fires (e.g. above the fold already shown)
    setTimeout(runCounts, 1400);
  } else {
    runCounts();
  }

  /* ---------- board light/dark shot toggle ---------- */
  var boardShot = document.getElementById("boardShot");
  var stBtns = document.querySelectorAll(".st-btn");
  stBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      stBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      if (boardShot) boardShot.src = "assets/board-" + btn.getAttribute("data-shot") + ".png";
    });
  });

  /* ---------- "+ more" explorations toggle ---------- */
  var moreBtn = document.getElementById("expMore");
  var exploreGrid = document.querySelector(".explore-grid");
  if (moreBtn && exploreGrid) {
    moreBtn.addEventListener("click", function () {
      var open = exploreGrid.classList.toggle("is-open");
      moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
      var label = moreBtn.querySelector(".exp-more-label");
      if (label) label.textContent = open ? "Show less" : "Show";
      if (open) {
        var first = exploreGrid.querySelector(".exp-extra");
        if (first) first.focus({ preventScroll: true });
      }
    });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbClose = document.getElementById("lbClose");
  var lastFocused = null;

  function openLb(src, title, desc, alt) {
    if (!lb) return;
    lastFocused = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || title || "";
    lbCap.querySelector("strong").textContent = title || "";
    lbCap.querySelector("span").textContent = desc || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLb() {
    if (!lb) return;
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll(".exp[data-img]").forEach(function (card) {
    card.addEventListener("click", function () {
      var img = card.querySelector("img");
      openLb(card.getAttribute("data-img"), card.getAttribute("data-title"),
             card.getAttribute("data-desc"), img ? img.alt : "");
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb && !lb.hidden) closeLb();
  });

  /* ---------- scroll-spy: highlight the nav link for the section in view ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var spySections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);
  if (spySections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = "#" + e.target.id;
          navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    spySections.forEach(function (s) { spy.observe(s); });
  }
})();
