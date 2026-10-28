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

  // Booking form → WhatsApp
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const people = document.getElementById('people')?.value.trim() || '';
    const service = document.getElementById('service')?.value || '';
    const date = document.getElementById('date')?.value || '';
    const time = document.getElementById('time')?.value || '';
    const message = document.getElementById('message')?.value.trim() || '';

    if (!name || !service || !date || !time) return;

    let text = `Olá! Gostaria de agendar na Glamorize.\n\n`;
    text += `Nome: ${name}\n`;
    if (phone) text += `Telefone: ${phone}\n`;
    if (people) text += `Nº de pessoas: ${people}\n`;
    text += `Serviço: ${service}\n`;
    text += `Data: ${date}\n`;
    text += `Hora: ${time}\n`;
    if (message) text += `\nMensagem: ${message}`;

    window.open(`https://wa.me/244935627443?text=${encodeURIComponent(text)}`, '_blank');
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
