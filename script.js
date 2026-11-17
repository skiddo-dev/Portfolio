/* bobbice.dev: theme toggle, the results mapper, screenshot viewer, section highlighting. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function theme() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  /* ------------------------------------------------------------ theme */
  var toggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncTheme() {
    var dark = theme() === 'dark';
    if (toggle) toggle.setAttribute('aria-pressed', String(dark));
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#122d50' : '#eef3f8');
  }

  function setTheme(next, remember) {
    root.setAttribute('data-theme', next);
    if (remember) { try { localStorage.setItem('bb-theme', next); } catch (e) {} }
    syncTheme();
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = theme() === 'dark' ? 'light' : 'dark';
      if (!document.startViewTransition || reduceMotion.matches) { setTheme(next, true); return; }
      var r = toggle.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var t = document.startViewTransition(function () { setTheme(next, true); });
      t.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 560, easing: 'cubic-bezier(.3,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {});
    });
  }

  // Follow the system setting until the visitor picks a theme.
  var onSystemChange = function (e) {
    var stored = null;
    try { stored = localStorage.getItem('bb-theme'); } catch (err) {}
    if (stored !== 'light' && stored !== 'dark') setTheme(e.matches ? 'dark' : 'light', false);
  };
  if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemChange);
  syncTheme();

  /* ----------------------------------------------------- results mapper */
  var mapper = document.getElementById('mapper');
  if (mapper) {
    var svg = mapper.querySelector('.mapper__wires');
    var rows = Array.prototype.slice.call(mapper.querySelectorAll('tbody tr'));
    var wide = window.matchMedia('(min-width: 760px)');
    var NS = 'http://www.w3.org/2000/svg';
    var links = [];

    rows.forEach(function (row, i) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'link-group');
      g.style.setProperty('--i', i);
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'wire');
      path.setAttribute('pathLength', '1');
      var a = document.createElementNS(NS, 'circle');
      a.setAttribute('class', 'port');
      a.setAttribute('r', '4.5');
      var b = document.createElementNS(NS, 'circle');
      b.setAttribute('class', 'port');
      b.setAttribute('r', '4.5');
      b.style.setProperty('--d', '800ms');
      g.appendChild(path); g.appendChild(a); g.appendChild(b);
      svg.appendChild(g);
      links.push({ row: row, g: g, path: path, a: a, b: b });

      var on = function () { row.classList.add('is-active'); g.classList.add('is-active'); };
      var off = function () { row.classList.remove('is-active'); g.classList.remove('is-active'); };
      row.addEventListener('mouseenter', on);
      row.addEventListener('mouseleave', off);
      row.addEventListener('focusin', on);
      row.addEventListener('focusout', off);
    });

    var layout = function () {
      if (!wide.matches) return;
      var box = mapper.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
      svg.setAttribute('width', box.width);
      svg.setAttribute('height', box.height);
      links.forEach(function (l) {
        var needCell = l.row.querySelector('.c-need');
        var doneCell = l.row.querySelector('.c-done');
        var need = needCell.querySelector('.need').getBoundingClientRect();
        var done = doneCell.querySelector('.done').getBoundingClientRect();
        var nc = needCell.getBoundingClientRect();
        var dc = doneCell.getBoundingClientRect();
        var needPad = parseFloat(getComputedStyle(needCell).paddingRight) || 0;
        var donePad = parseFloat(getComputedStyle(doneCell).paddingLeft) || 0;
        var x1 = nc.right - needPad + 10 - box.left;
        var x2 = dc.left + donePad - 12 - box.left;
        var y1 = need.top + need.height / 2 - box.top;
        var y2 = done.top + done.height / 2 - box.top;
        var dx = (x2 - x1) * 0.55;
        l.path.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + (x1 + dx) + ' ' + y1 + ' ' + (x2 - dx) + ' ' + y2 + ' ' + x2 + ' ' + y2);
        l.a.setAttribute('cx', x1); l.a.setAttribute('cy', y1);
        l.b.setAttribute('cx', x2); l.b.setAttribute('cy', y2);
      });
    };

    var queued = false;
    var schedule = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; layout(); });
    };

    layout();
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(mapper);
    else window.addEventListener('resize', schedule);
    if (wide.addEventListener) wide.addEventListener('change', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);

    // Draw the wires once, when the mapper first comes into view.
    if (!reduceMotion.matches && 'IntersectionObserver' in window) {
      mapper.classList.add('is-armed');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          mapper.classList.add('is-drawn');
          io.disconnect();
          setTimeout(function () { mapper.classList.remove('is-armed', 'is-drawn'); }, 2400);
        });
      }, { threshold: 0.25 });
      io.observe(mapper);
    }
  }

  /* ------------------------------------------------ board screenshot */
  var boardImg = document.getElementById('boardShot');
  var boardBtn = document.getElementById('boardButton');
  var segBtns = Array.prototype.slice.call(document.querySelectorAll('[data-shot]'));
  var pickedShot = false;

  function showBoard(mode) {
    if (!boardImg) return;
    var src = 'assets/board-' + mode + '.png';
    if (boardImg.getAttribute('src') !== src) boardImg.setAttribute('src', src);
    if (boardBtn) boardBtn.setAttribute('data-view', src);
    segBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-shot') === mode)); });
  }
  segBtns.forEach(function (b) {
    b.addEventListener('click', function () { pickedShot = true; showBoard(b.getAttribute('data-shot')); });
  });
  document.addEventListener('themechange', function (e) { if (!pickedShot) showBoard(e.detail); });
  showBoard(theme());

  /* ------------------------------------------------------------ viewer */
  var viewer = document.getElementById('viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    var vImg = viewer.querySelector('.viewer__img');
    var vTitle = viewer.querySelector('.viewer__title');
    var vDesc = viewer.querySelector('.viewer__desc');

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-view]');
      if (!trigger) return;
      var thumb = trigger.querySelector('img');
      vImg.src = trigger.getAttribute('data-view');
      vImg.alt = (thumb && thumb.getAttribute('alt')) || trigger.getAttribute('data-title') || '';
      vTitle.textContent = trigger.getAttribute('data-title') || '';
      vDesc.textContent = trigger.getAttribute('data-desc') || '';
      viewer.showModal();
    });
    viewer.querySelector('.viewer__close').addEventListener('click', function () { viewer.close(); });
    viewer.addEventListener('click', function (e) { if (e.target === viewer) viewer.close(); });
    var blank = vImg.getAttribute('src');
    viewer.addEventListener('close', function () { vImg.setAttribute('src', blank); });
  } else if (viewer) {
    // Very old browsers: open the full image instead.
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-view]');
      if (trigger) window.open(trigger.getAttribute('data-view'), '_blank', 'noopener');
    });
  }

  /* ----------------------------------------------- current section */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current') === 'true') {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }
})();
