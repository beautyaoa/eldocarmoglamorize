/**
 * Eldo Carmo Glamorize
 * Menu drawer · Header scroll · Booking → WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const menuDrawer = document.getElementById('menu-drawer');
  const menuOverlay = document.getElementById('menu-overlay');
  const menuClose = document.getElementById('menu-close');
  const bookingForm = document.getElementById('booking-form');

  /* ——— CMS: published catalog → texts / services / gallery ——— */
  async function loadAndApplyCms() {
    const defaults = window.GLAMORIZE_DEFAULTS || {};
    let catalog = defaults;
    const cfg = window.GLAMORIZE_CONFIG;
    if (cfg && cfg.catalogUrl) {
      try {
        const res = await fetch(cfg.catalogUrl + '?t=' + Date.now());
        if (res.ok) {
          const remote = await res.json();
          catalog = {
            ...defaults,
            ...remote,
            products: Array.isArray(remote.products) ? remote.products : defaults.products,
            gallery: Array.isArray(remote.gallery) ? remote.gallery : defaults.gallery,
            site: { ...(defaults.site || {}), ...(remote.site || {}) }
          };
        }
      } catch (_) {}
    }
    applySiteContent(catalog.site || defaults.site || {});
    // Homepage services = products
    renderServices(catalog.products || defaults.products || []);
    renderGallery(catalog.gallery || defaults.gallery || []);
    const select = document.getElementById('service');
    if (select && Array.isArray(catalog.products)) {
      const active = catalog.products.filter((s) => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
      if (active.length) {
        const current = select.value;
        select.innerHTML =
          '<option value="">Seleccione o serviço</option>' +
          active.map((s) => `<option value="${s.name}">${s.name}</option>`).join('');
        if (current) select.value = current;
      }
    }
  }

  function applySiteContent(site) {
    if (!site) return;
    const setText = (key, html) => {
      document.querySelectorAll(`[data-cms="${key}"]`).forEach((el) => {
        if (el.tagName === 'IMG') {
          if (site[key]) el.src = site[key];
          return;
        }
        if (html) el.innerHTML = String(site[key] || '').replace(/\n/g, '<br>');
        else if (site[key] != null && site[key] !== '') el.textContent = site[key];
      });
    };
    setText('heroEyebrow');
    setText('heroTitle', true);
    setText('heroSubtitle');
    setText('servicesEyebrow');
    setText('servicesTitle');
    setText('servicesNote');
    setText('experienceEyebrow');
    setText('experienceTitle');
    setText('galleryEyebrow');
    setText('galleryTitle');
    setText('bookingEyebrow');
    setText('bookingTitle');
    const announce = document.querySelector('[data-cms="announce"]');
    if (announce) {
      if (site.announceText) announce.innerHTML = site.announceText;
      if (site.announceHref) announce.href = site.announceHref;
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function renderServices(services) {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    const list = (services || [])
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!list.length) return;
    grid.innerHTML = list
      .map((s) => {
        const price =
          s.priceLabel ||
          (s.price > 0 ? Number(s.price).toLocaleString('pt-AO') + ' Kz' : 'Consultar preço');
        return `
      <article class="service-card" data-service="${escapeAttr(s.name)}">
        <div class="service-card__image">
          <img src="${escapeAttr(s.image || '')}" alt="${escapeAttr(s.name)}" loading="lazy">
        </div>
        <div class="service-card__overlay">
          <h3 class="service-card__title">${escapeHtml(s.name)}</h3>
          <p class="service-card__desc">${escapeHtml(s.description || '')}</p>
          <p class="service-card__price">${escapeHtml(price)}</p>
          <a href="#agendar" class="btn btn--service agendar-btn">Agendar</a>
        </div>
      </article>`;
      })
      .join('');
    grid.querySelectorAll('.agendar-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.service-card');
        const service = card?.dataset.service;
        const select = document.getElementById('service');
        if (service && select) select.value = service;
      });
    });
  }

  function renderGallery(items) {
    const grid = document.getElementById('gallery-grid');
    if (!grid || !items || !items.length) return;
    grid.innerHTML = items
      .map(
        (g) => `
      <figure class="gallery-item">
        <img src="${escapeAttr(g.image || '')}" alt="${escapeAttr(g.alt || '')}" loading="lazy">
      </figure>`
      )
      .join('');
  }

  loadAndApplyCms();

  const openMenu = () => {
    hamburger?.classList.add('is-active');
    menuDrawer?.classList.add('is-open');
    hamburger?.setAttribute('aria-expanded', 'true');
    menuDrawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger?.classList.remove('is-active');
    menuDrawer?.classList.remove('is-open');
    hamburger?.setAttribute('aria-expanded', 'false');
    menuDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  hamburger?.addEventListener('click', () => {
    if (menuDrawer?.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  menuClose?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);

  menuDrawer?.querySelectorAll('.menu-drawer__link').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  // ---------- Hero: single looping video (Safari-safe autoplay) ----------
  const heroVideo1 = document.getElementById('hero-video-1');
  if (heroVideo1) {
    heroVideo1.muted = true;
    heroVideo1.defaultMuted = true;
    heroVideo1.playsInline = true;
    heroVideo1.setAttribute('playsinline', '');
    heroVideo1.setAttribute('webkit-playsinline', '');
    heroVideo1.loop = true;
    heroVideo1.classList.add('is-visible');

    const tryPlayHero = () => {
      const p = heroVideo1.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          setTimeout(() => {
            heroVideo1.muted = true;
            heroVideo1.play().catch(() => {});
          }, 200);
        });
      }
    };

    if (heroVideo1.readyState >= 2) {
      tryPlayHero();
    } else {
      heroVideo1.addEventListener('loadeddata', tryPlayHero, { once: true });
      heroVideo1.addEventListener('canplay', tryPlayHero, { once: true });
    }

    // Fallback: first user gesture (Safari autoplay policy)
    const unlockHero = () => {
      heroVideo1.muted = true;
      heroVideo1.play().catch(() => {});
      document.removeEventListener('touchstart', unlockHero);
      document.removeEventListener('click', unlockHero);
    };
    document.addEventListener('touchstart', unlockHero, { once: true, passive: true });
    document.addEventListener('click', unlockHero, { once: true });
  }

  // Service card → pre-fill booking
  document.querySelectorAll('.agendar-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.service-card');
      const service = card?.dataset.service;
      const select = document.getElementById('service');
      if (service && select) {
        select.value = service;
      }
    });
  });

  // Booking form → Admin API
  bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const people = document.getElementById('people')?.value.trim() || '';
    const service = document.getElementById('service')?.value || '';
    const date = document.getElementById('date')?.value || '';
    const time = document.getElementById('time')?.value || '';
    const message = document.getElementById('message')?.value.trim() || '';

    if (!name || !service || !date || !time) return;

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'A enviar…';
    }

    const booking = {
      id: 'bk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: 'booking',
      status: 'pending',
      createdAt: new Date().toISOString(),
      customer: { name, phone: phone || '' },
      people: people ? Number(people) : null,
      service,
      date,
      time,
      notes: message || ''
    };

    const workerUrl = (window.GLAMORIZE_CONFIG && window.GLAMORIZE_CONFIG.workerUrl) || '';
    let ok = false;
    let apiError = '';

    if (workerUrl) {
      try {
        const res = await fetch(workerUrl.replace(/\/$/, '') + '/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking)
        });
        ok = res.ok;
        if (!ok) {
          const data = await res.json().catch(() => ({}));
          apiError = data.error || ('Erro ' + res.status);
        }
      } catch (err) {
        console.warn('Booking API', err);
        apiError = 'Sem ligação ao servidor';
      }
    }

    try {
      const key = 'glamorize_bookings_local';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift(booking);
      localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
    } catch (_) {}

    bookingForm.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }

    const statusEl = document.getElementById('booking-status');
    const showStatus = (msg, type) => {
      if (!statusEl) {
        alert(msg);
        return;
      }
      statusEl.hidden = false;
      statusEl.className = 'form-status form-status--' + type;
      statusEl.textContent = msg;
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    if (ok) {
      showStatus('Pedido recebido. A equipa Glamorize confirma o seu horário em breve. Obrigado!', 'success');
    } else if (workerUrl) {
      showStatus(
        'O seu pedido foi registado neste dispositivo. Se não aparecer no painel de outra máquina, a API de agendamentos precisa de ser actualizada (redeploy do Worker).',
        'warn'
      );
      console.warn('Booking API falhou:', apiError);
    } else {
      showStatus('Pedido guardado neste dispositivo. Configure a API para receber no painel admin.', 'warn');
    }
  });

  // ---------- Experience videos (full play with sound) ----------
  document.querySelectorAll('.experience-card').forEach((card) => {
    const video = card.querySelector('.experience-card__video');
    const playBtn = card.querySelector('.experience-card__play');
    if (!video || !playBtn) return;

    const toggle = () => {
      if (video.paused) {
        document.querySelectorAll('.experience-card__video').forEach((v) => {
          if (v !== video) {
            v.pause();
            v.closest('.experience-card')?.classList.remove('is-playing');
          }
        });
        video.muted = false;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            video.muted = true;
            video.play().catch(() => {});
          });
        }
        card.classList.add('is-playing');
      } else {
        video.pause();
        card.classList.remove('is-playing');
      }
    };

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
    card.addEventListener('click', () => toggle());
    video.addEventListener('ended', () => {
      card.classList.remove('is-playing');
    });
  });

  // Experience carousel arrows
  const expTrack = document.getElementById('experience-track');
  const expPrev = document.getElementById('experience-prev');
  const expNext = document.getElementById('experience-next');

  if (expTrack && expPrev && expNext) {
    const scrollByCard = (dir) => {
      const card = expTrack.querySelector('.experience-card');
      if (!card) return;
      const step = card.offsetWidth + 16;
      expTrack.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    const updateNav = () => {
      const maxScroll = expTrack.scrollWidth - expTrack.clientWidth - 2;
      expPrev.disabled = expTrack.scrollLeft <= 2;
      expNext.disabled = expTrack.scrollLeft >= maxScroll;
    };

    expPrev.addEventListener('click', () => scrollByCard(-1));
    expNext.addEventListener('click', () => scrollByCard(1));
    expTrack.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    updateNav();
  }

  // Header scroll + announce bar
  const header = document.getElementById('header');
  const announceBar = document.querySelector('.announce-bar');
  const onScrollHeader = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('announce-hidden', y > 20);
    }
    if (announceBar) {
      announceBar.classList.toggle('is-hidden', y > 20);
    }
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();
});
