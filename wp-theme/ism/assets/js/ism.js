/* ISM Theme JS — scroll reveal, nav, mobile menu */
(function () {
  'use strict';

  const nav    = document.getElementById('ism-nav');
  const toggle = nav && nav.querySelector('.ism-nav__toggle');
  const menu   = nav && nav.querySelector('.ism-nav__menu');

  // ─── Nav scroll behaviour ──────────────────────────────────────

  let lastY = 0;
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (!nav) { ticking = false; return; }

      if (y > 80) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }

      // Hide on scroll down, show on scroll up (only past first screen)
      if (y > 300) {
        if (y > lastY + 8) {
          nav.classList.add('is-hidden');
        } else if (y < lastY - 4) {
          nav.classList.remove('is-hidden');
        }
      } else {
        nav.classList.remove('is-hidden');
      }

      lastY = y;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── Mobile menu toggle ────────────────────────────────────────

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = nav.classList.toggle('menu-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';

      // Prevent nav hide while menu is open
      if (open) nav.classList.remove('is-hidden');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('menu-open') && !nav.contains(e.target)) {
        nav.classList.remove('menu-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('menu-open')) {
        nav.classList.remove('menu-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  // ─── Scroll Reveal ────────────────────────────────────────────

  function initReveal() {
    // Auto-wrap sections in reveal if not already wrapped
    const sections = document.querySelectorAll(
      '.ism-page-content > section, .ism-service-card, .ism-review-card, .ism-step, .ism-badge'
    );

    sections.forEach(function (el) {
      if (!el.classList.contains('ism-reveal')) {
        el.classList.add('ism-reveal');
      }
    });

    const reveals = document.querySelectorAll('.ism-reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(function (el, i) {
      // Stagger siblings in grid containers
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.querySelectorAll('.ism-reveal'));
        const idx = siblings.indexOf(el);
        if (idx > 0 && idx < 4) {
          el.style.transitionDelay = (idx * 0.1) + 's';
        }
      }
      observer.observe(el);
    });
  }

  // ─── Smooth anchor scroll ──────────────────────────────────────

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ─── Init ─────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

})();
