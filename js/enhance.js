/* Serio Fitness – interactive layer (no text changes, progressive enhancement) */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var nav = document.getElementById('nav');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }

  /* ---------- Scroll progress + floating buttons ---------- */
  var bar = el('div', 'scroll-progress');
  document.body.appendChild(bar);

  var R = 21, C = 2 * Math.PI * R;
  var stack = el('div', 'fab-stack');
  var topBtn = el('button', 'fab fab--top',
    '<svg viewBox="0 0 46 46" aria-hidden="true"><defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#f6c618"/><stop offset="1" stop-color="#ff9ed6"/></linearGradient></defs>' +
    '<circle class="ring-bg" cx="23" cy="23" r="' + R + '"/><circle class="ring" cx="23" cy="23" r="' + R + '"/></svg>' +
    '<i class="fa fa-arrow-up"></i>');
  topBtn.type = 'button';
  topBtn.setAttribute('aria-label', 'Sus');
  var ring = topBtn.querySelector('.ring');
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C;
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  var waLink = document.querySelector('.hero .btn--wa');
  var waBtn = el('a', 'fab fab--wa', '<i class="fa fa-whatsapp"></i>');
  waBtn.href = waLink ? waLink.href : 'https://wa.me/40754696058';
  waBtn.target = '_blank';
  waBtn.rel = 'noopener';
  waBtn.setAttribute('aria-label', 'WhatsApp');
  stack.appendChild(topBtn);
  stack.appendChild(waBtn);
  document.body.appendChild(stack);

  /* ---------- WhatsApp: choose who to talk to ---------- */
  var WA_PEOPLE = [
    ['fitness', 'Fitness', 'Sergiu', '40754696058', '0754 696 058', 'Salut! Aș vrea să programez o ședință de fitness.'],
    ['pilates', 'Pilates Reformer', 'Henrietta', '40752939912', '0752 939 912', 'Salut! Aș vrea să programez o ședință de Pilates Reformer.'],
    ['masaj', 'Masaj & Relaxare', 'Anca', '40748153343', '0748 153 343', 'Salut! Aș vrea să programez o ședință de masaj.']
  ];
  var wa = el('div', 'wa-pick');
  wa.setAttribute('role', 'dialog');
  wa.setAttribute('aria-modal', 'true');
  wa.setAttribute('aria-labelledby', 'waPickTitle');
  var waCard = el('div', 'wa-pick__card',
    '<button class="wa-pick__close" type="button" aria-label="Închide">&times;</button>' +
    '<div class="wa-pick__head"><i class="fa fa-whatsapp"></i><div><h3 id="waPickTitle">Cu cine vrei să vorbești?</h3>' +
    '<p>Alege serviciul și scrie-ne direct pe WhatsApp.</p></div></div>');
  WA_PEOPLE.forEach(function (p) {
    var a = el('a', 'wa-pick__opt wa-pick__opt--' + p[0],
      '<span class="wa-pick__dot"></span><span class="wa-pick__txt"><strong>' + p[1] + '</strong><small>' + p[2] + ' · ' + p[4] + '</small></span><i class="fa fa-chevron-right"></i>');
    a.href = 'https://wa.me/' + p[3] + '?text=' + encodeURIComponent(p[5]);
    a.target = '_blank';
    a.rel = 'noopener';
    waCard.appendChild(a);
  });
  wa.appendChild(waCard);
  document.body.appendChild(wa);
  var closeWa = function () { wa.classList.remove('open'); document.body.style.overflow = ''; };
  wa.addEventListener('click', function (e) {
    if (e.target === wa || e.target.closest('.wa-pick__close') || e.target.closest('.wa-pick__opt')) closeWa();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && wa.classList.contains('open')) closeWa(); });
  // generic WhatsApp buttons open the picker; per-section buttons still go straight to that person
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"]');
    if (!a || a.closest('.book-line') || a.closest('.wa-pick')) return;
    e.preventDefault();
    wa.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { waCard.querySelector('.wa-pick__opt').focus(); }, 50);
  });

  /* ---------- Scroll handler (rAF-throttled) ---------- */
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(y / max, 1) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    ring.style.strokeDashoffset = C * (1 - p);
    topBtn.classList.toggle('show', y > window.innerHeight * 0.6);

    // hide nav when scrolling down, show when scrolling up
    if (!nav.classList.contains('open')) {
      nav.classList.toggle('nav--hidden', y > lastY && y > 400);
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Scrollspy: highlight current section in nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var spyTargets = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Hero: scroll cue + pointer spotlight ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    hero.insertBefore(el('div', 'hero__spot'), hero.firstChild);
    var cue = el('a', 'scroll-cue');
    cue.href = '#despre';
    cue.setAttribute('aria-label', 'Despre Noi');
    hero.appendChild(cue);
    if (finePointer && !reduceMotion) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--hx', (e.clientX - r.left) + 'px');
        hero.style.setProperty('--hy', (e.clientY - r.top) + 'px');
      });
    }
  }

  /* ---------- Buttons: ripple ---------- */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn');
    if (!b || reduceMotion) return;
    var r = b.getBoundingClientRect();
    var size = Math.max(r.width, r.height);
    var s = el('span', 'ripple');
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    b.appendChild(s);
    setTimeout(function () { s.remove(); }, 700);
  });

  /* ---------- Cards: spotlight glow + 3D tilt ---------- */
  var cards = document.querySelectorAll('.pillar, .coach, .price-card');
  cards.forEach(function (card) {
    card.appendChild(el('span', 'glow'));
    if (!finePointer || reduceMotion) return;
    var maxTilt = card.classList.contains('price-card') ? 3 : 6;
    card.classList.add('tilt');
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (x * 100) + '%');
      card.style.setProperty('--my', (y * 100) + '%');
      card.style.setProperty('--ry', ((x - 0.5) * 2 * maxTilt).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - y) * 2 * maxTilt).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- Prices: count up when visible (final text identical) ---------- */
  var amounts = document.querySelectorAll('.price-row__amount');
  function countUp(node) {
    var original = node.textContent;
    var m = original.match(/^(\D*)([\d.]+)(.*)$/);
    if (!m || reduceMotion) return;
    var target = parseInt(m[2].replace(/\./g, ''), 10), start = null, dur = 1100;
    function step(t) {
      if (!start) start = t;
      var k = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - k, 3);
      node.textContent = m[1] + Math.round(target * eased).toLocaleString('ro-RO') + m[3];
      if (k < 1) requestAnimationFrame(step); else node.textContent = original;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    amounts.forEach(function (a) { cio.observe(a); });
  }

  /* ---------- Preselect service when a button says which one ---------- */
  document.querySelectorAll('[data-service]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = document.getElementById('bService');
      if (sel) sel.value = b.dataset.service;
    });
  });

  /* ---------- Massage prices: dropdown + Ședință / Abonament ---------- */
  // [durată, detalii, preț]
  var MASAJ = {
    'Masaj clasic': {
      single: [['30 min / ședință', 'Toate grupele musculare din zona spatelui și zona cervicală', 80],
               ['60 min / ședință', 'Tot corpul', 120]],
      sub:    [['30 min × 5 ședințe / lună', '', 320],
               ['60 min × 5 ședințe / lună', '', 480]]
    },
    'Masaj reflexoterapeutic': {
      single: [['30 min / ședință', 'Masaj de relaxare în talpă, trecând prin toate punctele reflexogene', 70],
               ['45 min / ședință', 'Schemă de masaj pentru afecțiuni: rinichi, prostată, glande, cardiovasculare, digestive, biliare, genitale, pulmonare', 100]],
      sub:    [['30 min × 4 ședințe / lună', '', 220],
               ['45 min × 4 ședințe / lună', '', 320]]
    },
    'Drenaj limfatic': {
      single: [['40 min / ședință', 'Zonă cap, gât, față', 70],
               ['50 min / ședință', 'Brațe + piept + abdomen + picioare', 80],
               ['90 min / ședință', 'Tot corpul', 130]],
      sub:    [['40 min × 4 ședințe / lună', 'Zonă cap, gât, față', 230],
               ['50 min × 4 ședințe / lună', 'Brațe + piept + abdomen + picioare', 280],
               ['90 min × 4 ședințe / lună', 'Tot corpul', 420]]
    },
    'Masaj terapeutic': {
      single: [['30 min / ședință', 'Masajul spatelui, membrelor inferioare, superioare și gâtului', 130],
               ['30 min / ședință', 'Pentru picioare umflate', 80]],
      sub:    [['30 min × 5 ședințe / lună', 'Masajul spatelui, membrelor inferioare, superioare și zona cervicală', 520],
               ['30 min × 5 ședințe / lună', 'Pentru picioare umflate', 370]]
    },
    'Masaj deep tissue': {
      single: [['30 min / ședință', '', 100]],
      sub:    [['30 min × 5 ședințe / lună', '', 400]]
    },
    'Masaj anticelulitic': {
      single: [['30–40 min / ședință', 'Picioare / fese', 120]],
      sub:    [['30–40 min × 10 ședințe', 'Picioare / fese', 900]]
    }
  };
  var mType = document.getElementById('massageType');
  var mRows = document.getElementById('massageRows');
  if (mType && mRows) {
    var mMode = 'single';
    Object.keys(MASAJ).forEach(function (k) { mType.add(new Option(k, k)); });
    var renderMasaj = function () {
      mRows.innerHTML = '';
      MASAJ[mType.value][mMode].forEach(function (r) {
        var row = el('div', 'price-row');
        var info = el('div', 'price-row__info');
        var h = el('h4'); h.textContent = r[0]; info.appendChild(h);
        if (r[1]) { var d = el('p'); d.textContent = r[1]; info.appendChild(d); }
        var amt = el('div', 'price-row__amount'); amt.textContent = r[2] + ' RON';
        row.appendChild(info); row.appendChild(amt);
        mRows.appendChild(row);
        countUp(amt);
      });
      mRows.classList.remove('swap'); void mRows.offsetWidth; mRows.classList.add('swap');
    };
    mType.addEventListener('change', renderMasaj);
    var mSeg = document.querySelector('.massage-prices .seg');
    var mBtns = mSeg.querySelectorAll('.seg__btn');
    mBtns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        mMode = btn.dataset.mode;
        mSeg.classList.toggle('is-right', i === 1);
        mBtns.forEach(function (b) { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn); });
        renderMasaj();
      });
    });
    renderMasaj();
  }

  /* ---------- Pilates tabs: Grup / Privat 1:1 ---------- */
  document.querySelectorAll('.seg:not(.seg--sand)').forEach(function (seg) {
    var btns = seg.querySelectorAll('.seg__btn');
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        seg.classList.toggle('is-right', i === 1);
        btns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-selected', on);
          document.getElementById(b.dataset.tab).hidden = !on;
        });
      });
    });
  });

  /* ---------- Lightbox for photos ---------- */
  var lb = el('div', 'lightbox', '<button class="lightbox__close" type="button" aria-label="Închide">&times;</button><img alt="">');
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  document.querySelectorAll('.about__media img, .media-duo img, .massage-media img, .coach__photo img').forEach(function (img) {
    img.classList.add('zoomable');
    img.addEventListener('click', function () {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });

  /* ---------- Booking form: live validation feedback ---------- */
  var form = document.getElementById('bookingForm');
  if (form) {
    var fields = form.querySelectorAll('input[required], select[required]');
    fields.forEach(function (f) {
      var wrap = f.closest('.field');
      f.addEventListener('input', function () {
        wrap.classList.remove('invalid');
        wrap.classList.toggle('valid', f.value.trim() !== '' && f.checkValidity());
      });
      f.addEventListener('invalid', function () {
        wrap.classList.add('invalid');
        wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake');
      });
    });
    form.addEventListener('reset', function () {
      form.querySelectorAll('.field').forEach(function (w) { w.classList.remove('valid', 'invalid'); });
    });

    // focus first field when the modal opens (desktop only, avoids popping the phone keyboard)
    if (finePointer) {
      document.querySelectorAll('[data-open-modal]').forEach(function (b) {
        b.addEventListener('click', function () { setTimeout(function () { form.querySelector('input').focus(); }, 150); });
      });
    }
  }
})();
