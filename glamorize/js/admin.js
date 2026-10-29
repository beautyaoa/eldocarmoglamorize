/**
 * Eldo Carmo Glamorize — Admin
 * Sidebar UI · stay logged in · orders from Worker + local merge
 */
(function () {
  const CONFIG = window.GLAMORIZE_CONFIG;
  const DEFAULTS = window.GLAMORIZE_DEFAULTS;
  const DRAFT_KEY = 'glamorize_admin_draft';
  const SESSION_KEY = 'glamorize_admin_ok';
  const PW_KEY = 'glamorize_admin_pw';
  const REMEMBER_KEY = 'glamorize_admin_remember';
  const ORDERS_LOCAL = 'glamorize_orders_local';
  const BOOKINGS_LOCAL = 'glamorize_bookings_local';
  const TITLES = {
    dashboard: 'Painel',
    orders: 'Encomendas',
    bookings: 'Agendamentos',
    products: 'Serviços',
    content: 'Conteúdo',
    gallery: 'Galeria',
    zones: 'Zonas',
    images: 'Imagens'
  };

  let catalog = structuredClone(DEFAULTS);
  let orders = [];
  let orderFilter = 'all';
  let bookings = [];
  let bookingFilter = 'all';
  let mediaLibrary = [];
  let editingProductId = null;
  let productSearch = '';
  let dragProductId = null;

  /* ——— Storage helpers (session vs persistent) ——— */
  function authStore() {
    return localStorage.getItem(REMEMBER_KEY) === '1' ? localStorage : sessionStorage;
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1' || localStorage.getItem(SESSION_KEY) === '1';
  }

  function setAuth(password, remember) {
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, '1');
      localStorage.setItem(SESSION_KEY, '1');
      localStorage.setItem(PW_KEY, password);
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(PW_KEY);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PW_KEY);
      sessionStorage.setItem(SESSION_KEY, '1');
      sessionStorage.setItem(PW_KEY, password);
    }
  }

  /** Verify password against Worker before opening admin */
  async function verifyPassword(password) {
    if (!CONFIG.workerUrl) {
      return { ok: false, reason: 'no-api' };
    }
    try {
      const res = await fetch(CONFIG.workerUrl.replace(/\/$/, '') + '/orders', {
        headers: { 'X-Admin-Password': password }
      });
      if (res.status === 401) return { ok: false, reason: 'unauthorized' };
      if (!res.ok) return { ok: false, reason: 'error', status: res.status };
      return { ok: true };
    } catch (e) {
      console.warn(e);
      return { ok: false, reason: 'network' };
    }
  }

  async function login(password, remember) {
    const result = await verifyPassword(password);
    if (!result.ok) {
      const msg =
        result.reason === 'unauthorized'
          ? 'Password incorrecta'
          : result.reason === 'no-api'
            ? 'API não configurada (workerUrl). Não é possível validar a password.'
            : result.reason === 'network'
              ? 'Sem ligação à API. Tente de novo.'
              : 'Não foi possível validar a password.';
      showLoginError(msg);
      return false;
    }
    setAuth(password, remember);
    showApp();
    return true;
  }

  function showLoginError(msg) {
    let el = document.getElementById('login-error');
    if (!el) {
      el = document.createElement('p');
      el.id = 'login-error';
      el.className = 'login-error';
      document.getElementById('login-form')?.appendChild(el);
    }
    el.textContent = msg;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PW_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PW_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    location.reload();
  }

  function getPassword() {
    return sessionStorage.getItem(PW_KEY) || localStorage.getItem(PW_KEY) || '';
  }

  /* ——— Catalog ——— */
  async function loadLiveCatalog() {
    setStatus('A carregar catálogo…');
    try {
      const url = CONFIG.catalogUrl + '?t=' + Date.now();
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        catalog = merge(DEFAULTS, remote);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(catalog));
        setStatus('Catálogo actualizado · ' + formatDate(catalog.updatedAt));
        return true;
      }
    } catch (e) {
      console.warn(e);
    }
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        catalog = merge(DEFAULTS, JSON.parse(draft));
        setStatus('Modo offline — rascunho local');
        return false;
      }
    } catch (_) {}
    catalog = structuredClone(DEFAULTS);
    setStatus('A usar dados iniciais (ainda sem publicação)');
    return false;
  }

  function merge(base, remote) {
    return {
      ...base,
      ...remote,
      products: Array.isArray(remote.products) ? remote.products : base.products,
      services: Array.isArray(remote.services) ? remote.services : base.services,
      gallery: Array.isArray(remote.gallery) ? remote.gallery : base.gallery,
      zones: Array.isArray(remote.zones) ? remote.zones : base.zones,
      site: { ...(base.site || {}), ...(remote.site || {}) },
      texts: { ...base.texts, ...(remote.texts || {}) },
      images: { ...base.images, ...(remote.images || {}) }
    };
  }

  function saveDraft() {
    catalog.updatedAt = new Date().toISOString();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(catalog));
    setStatus('Rascunho guardado neste dispositivo');
  }

  async function publish() {
    const password = getPassword();
    if (!password) {
      setStatus('Sessão sem password — entre de novo');
      return;
    }
    if (!CONFIG.workerUrl) {
      setStatus('API ainda não configurada (workerUrl). Veja o guia da equipa.');
      return;
    }
    setStatus('A publicar…');
    const payload = {
      password,
      catalog: { ...catalog, updatedAt: new Date().toISOString() }
    };
    try {
      const res = await fetch(CONFIG.workerUrl.replace(/\/$/, '') + '/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Falha ao publicar');
      catalog.updatedAt = payload.catalog.updatedAt;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(catalog));
      setStatus('Publicado na loja · ' + formatDate(catalog.updatedAt));
    } catch (e) {
      console.error(e);
      setStatus('Erro ao publicar: ' + e.message);
    }
  }

  /* ——— Orders (Worker + local merge — fixes “missing order”) ——— */
  function getLocalOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_LOCAL) || '[]');
    } catch (_) {
      return [];
    }
  }

  function mergeOrders(remote, local) {
    const map = new Map();
    [...(local || []), ...(remote || [])].forEach((o) => {
      if (!o || !o.id) return;
      const prev = map.get(o.id);
      if (!prev || (o.updatedAt || o.createdAt || '') > (prev.updatedAt || prev.createdAt || '')) {
        map.set(o.id, o);
      }
    });
    return [...map.values()].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }

  async function loadOrders() {
    const listEl = document.getElementById('orders-list');
    if (listEl) listEl.innerHTML = '<p class="muted">A carregar encomendas…</p>';

    let remote = [];
    if (CONFIG.workerUrl) {
      try {
        const res = await fetch(CONFIG.workerUrl.replace(/\/$/, '') + '/orders', {
          headers: { 'X-Admin-Password': getPassword() }
        });
        if (res.ok) remote = await res.json();
        else if (res.status === 401) setStatus('Password incorrecta para a API');
      } catch (e) {
        console.warn('Orders API', e);
        setStatus('Não foi possível contactar a API de encomendas');
      }
    }

    const local = getLocalOrders();
    orders = mergeOrders(remote, local);
    renderOrders();
    updateDashboard();
    updateConnectionHint(remote.length, local.length);
  }

  function updateConnectionHint(remoteCount, localCount) {
    const el = document.getElementById('connection-hint');
    if (!el) return;
    if (!CONFIG.workerUrl) {
      el.className = 'dash-card dash-card--hint warn';
      el.innerHTML =
        '<strong>API não ligada.</strong> As encomendas ficam só neste browser (modo local). ' +
        'Configure <code>workerUrl</code> em <code>js/products.js</code> depois de publicar o Worker — ' +
        'assim as encomendas da loja aparecem aqui em qualquer dispositivo. Ver guia da equipa.';
    } else if (remoteCount === 0 && localCount > 0) {
      el.className = 'dash-card dash-card--hint';
      el.textContent =
        'A mostrar ' +
        localCount +
        ' encomenda(s) guardada(s) neste browser. A API ainda não devolveu encomendas.';
    } else {
      el.className = 'dash-card dash-card--hint';
      el.textContent = CONFIG.workerUrl
        ? 'Ligado à API · encomendas sincronizadas.'
        : '';
    }
  }

  function filteredOrders() {
    if (orderFilter === 'all') return orders;
    return orders.filter((o) => (o.status || 'pending') === orderFilter);
  }

  function orderActionsHtml() {
    return `
          <div class="order-actions">
            <button type="button" data-status="confirmed">Confirmar</button>
            <button type="button" data-status="delivered">Entregue</button>
            <button type="button" data-status="cancelled" class="danger">Cancelar</button>
            <button type="button" data-action="delete" class="danger">Eliminar</button>
          </div>`;
  }

  function bindOrderCardActions(root) {
    if (!root) return;
    root.querySelectorAll('.order-actions button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.order-card')?.dataset.id;
        if (!id) return;
        if (btn.dataset.action === 'delete') {
          deleteOrder(id);
        } else if (btn.dataset.status) {
          updateOrderStatus(id, btn.dataset.status);
        }
      });
    });
  }

  function renderOrders() {
    const listEl = document.getElementById('orders-list');
    const dashEl = document.getElementById('dash-orders');
    const badge = document.getElementById('orders-badge');
    const pending = orders.filter((o) => (o.status || 'pending') === 'pending').length;
    if (badge) {
      badge.hidden = pending === 0;
      badge.textContent = pending;
    }

    const list = filteredOrders();
    const html = !list.length
      ? '<div class="empty-state">Nenhuma encomenda neste filtro.</div>'
      : list
          .map((o) => {
            const items = (o.items || [])
              .map((i) => escapeHtml(i.name) + ' × ' + i.qty)
              .join(', ');
            return `
        <article class="order-card" data-id="${escapeAttr(o.id)}">
          <header>
            <strong>${escapeHtml(o.customer?.name || '—')}</strong>
            <span class="badge badge--${escapeAttr(o.status || 'pending')}">${escapeHtml(
              statusLabel(o.status)
            )}</span>
          </header>
          <p class="order-meta">${formatDate(o.createdAt)} · ${escapeHtml(o.customer?.phone || '')}</p>
          <p class="order-addr">${escapeHtml(o.customer?.address || '')} · ${escapeHtml(
              o.zone?.name || ''
            )}</p>
          <p class="order-items">${items}</p>
          <p class="order-total"><strong>${formatPrice(o.total)}</strong></p>
          ${
            o.customer?.notes
              ? '<p class="order-notes">' + escapeHtml(o.customer.notes) + '</p>'
              : ''
          }
          ${orderActionsHtml()}
        </article>`;
          })
          .join('');

    if (listEl) {
      listEl.innerHTML = html;
      bindOrderCardActions(listEl);
    }

    if (dashEl) {
      const recent = orders.slice(0, 5);
      dashEl.innerHTML = !recent.length
        ? '<p class="muted">Ainda sem encomendas.</p>'
        : recent
            .map(
              (o) =>
                `<article class="order-card order-card--compact" data-id="${escapeAttr(o.id)}">
            <header>
              <strong>${escapeHtml(o.customer?.name || '—')}</strong>
              <span class="badge badge--${escapeAttr(o.status || 'pending')}">${escapeHtml(
                  statusLabel(o.status)
                )}</span>
            </header>
            <p class="order-meta">${formatDate(o.createdAt)} · ${formatPrice(o.total)}</p>
            ${orderActionsHtml()}
          </article>`
            )
            .join('');
      bindOrderCardActions(dashEl);
    }
  }

  function statusLabel(s) {
    const map = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
      delivered: 'Entregue',
      cancelled: 'Cancelada'
    };
    return map[s] || s || 'Pendente';
  }

  async function updateOrderStatus(id, status) {
    if (CONFIG.workerUrl) {
      try {
        const res = await fetch(
          CONFIG.workerUrl.replace(/\/$/, '') + '/orders/' + encodeURIComponent(id),
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Password': getPassword()
            },
            body: JSON.stringify({ status })
          }
        );
        if (!res.ok) throw new Error('Falha ao actualizar');
      } catch (e) {
        setStatus('Erro ao actualizar estado: ' + e.message);
      }
    }
    // Always update local copy too
    let local = getLocalOrders();
    local = local.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    // If order only existed remotely, ensure local has it after merge
    orders = orders.map((o) => (o.id === id ? { ...o, status } : o));
    localStorage.setItem(ORDERS_LOCAL, JSON.stringify(mergeOrders(orders, local)));
    await loadOrders();
  }

  async function deleteOrder(id) {
    if (!confirm('Eliminar esta encomenda permanentemente? Esta acção não pode ser desfeita.')) {
      return;
    }
    if (CONFIG.workerUrl) {
      try {
        const res = await fetch(
          CONFIG.workerUrl.replace(/\/$/, '') + '/orders/' + encodeURIComponent(id),
          {
            method: 'DELETE',
            headers: {
              'X-Admin-Password': getPassword()
            }
          }
        );
        if (!res.ok && res.status !== 404) throw new Error('Falha ao eliminar');
      } catch (e) {
        setStatus('Erro ao eliminar: ' + e.message);
      }
    }
    // Remove from local storage and in-memory list
    const local = getLocalOrders().filter((o) => o.id !== id);
    localStorage.setItem(ORDERS_LOCAL, JSON.stringify(local));
    orders = orders.filter((o) => o.id !== id);
    renderOrders();
    updateDashboard();
    setStatus('Encomenda eliminada');
  }

  /* ——— Bookings ——— */
  function getLocalBookings() {
    try {
      return JSON.parse(localStorage.getItem(BOOKINGS_LOCAL) || '[]');
    } catch (_) {
      return [];
    }
  }

  async function loadBookings() {
    const listEl = document.getElementById('bookings-list');
    if (listEl) listEl.innerHTML = '<p class="muted">A carregar agendamentos…</p>';

    let remote = [];
    if (CONFIG.workerUrl) {
      try {
        const res = await fetch(CONFIG.workerUrl.replace(/\/$/, '') + '/bookings', {
          headers: { 'X-Admin-Password': getPassword() }
        });
        if (res.ok) remote = await res.json();
        else if (res.status === 401) setStatus('Password incorrecta para a API');
      } catch (e) {
        console.warn('Bookings API', e);
        setStatus('Não foi possível contactar a API de agendamentos');
      }
    }

    bookings = mergeOrders(remote, getLocalBookings());
    renderBookings();
    updateDashboard();
  }

  function filteredBookings() {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter((b) => (b.status || 'pending') === bookingFilter);
  }

  function formatBookingDate(dateStr, timeStr) {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y}` + (timeStr ? ' · ' + timeStr : '');
    } catch (_) {
      return dateStr + (timeStr ? ' · ' + timeStr : '');
    }
  }

  function renderBookings() {
    const listEl = document.getElementById('bookings-list');
    const dashEl = document.getElementById('dash-bookings');
    const badge = document.getElementById('bookings-badge');
    const pending = bookings.filter((b) => (b.status || 'pending') === 'pending').length;
    if (badge) {
      badge.hidden = pending === 0;
      badge.textContent = pending;
    }

    const list = filteredBookings();
    const html = !list.length
      ? '<div class="empty-state">Nenhum agendamento neste filtro.</div>'
      : list
          .map((b) => {
            return `
        <article class="order-card" data-id="${escapeAttr(b.id)}">
          <header>
            <strong>${escapeHtml(b.customer?.name || '—')}</strong>
            <span class="badge badge--${escapeAttr(b.status || 'pending')}">${escapeHtml(
              statusLabel(b.status)
            )}</span>
          </header>
          <p class="order-meta">${formatDate(b.createdAt)} · ${escapeHtml(b.customer?.phone || '—')}</p>
          <p class="order-items"><strong>${escapeHtml(b.service || '—')}</strong></p>
          <p class="order-addr">${escapeHtml(formatBookingDate(b.date, b.time))}${
              b.people ? ' · ' + escapeHtml(String(b.people)) + ' pessoa(s)' : ''
            }</p>
          ${
            b.notes
              ? '<p class="order-notes">' + escapeHtml(b.notes) + '</p>'
              : ''
          }
          ${orderActionsHtml()}
        </article>`;
          })
          .join('');

    if (listEl) {
      listEl.innerHTML = html;
      bindBookingCardActions(listEl);
    }
    if (dashEl) {
      const recent = bookings.slice(0, 5);
      dashEl.innerHTML = !recent.length
        ? '<p class="muted">Sem agendamentos recentes.</p>'
        : recent
            .map(
              (b) => `
          <div class="dash-row">
            <span>${escapeHtml(b.customer?.name || '—')} · ${escapeHtml(b.service || '')}</span>
            <span class="badge badge--${escapeAttr(b.status || 'pending')}">${escapeHtml(
              statusLabel(b.status)
            )}</span>
          </div>`
            )
            .join('');
    }
  }

  function bindBookingCardActions(root) {
    if (!root) return;
    root.querySelectorAll('.order-actions button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.order-card')?.dataset.id;
        if (!id) return;
        if (btn.dataset.action === 'delete') {
          deleteBooking(id);
        } else if (btn.dataset.status) {
          updateBookingStatus(id, btn.dataset.status);
        }
      });
    });
  }

  async function updateBookingStatus(id, status) {
    if (CONFIG.workerUrl) {
      try {
        const res = await fetch(
          CONFIG.workerUrl.replace(/\/$/, '') + '/bookings/' + encodeURIComponent(id),
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Password': getPassword()
            },
            body: JSON.stringify({ status })
          }
        );
        if (!res.ok) throw new Error('Falha ao actualizar');
      } catch (e) {
        setStatus('Erro ao actualizar: ' + e.message);
      }
    }
    let local = getLocalBookings();
    local = local.map((b) => (b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b));
    localStorage.setItem(BOOKINGS_LOCAL, JSON.stringify(local));
    bookings = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    localStorage.setItem(BOOKINGS_LOCAL, JSON.stringify(mergeOrders(bookings, local)));
    renderBookings();
    updateDashboard();
    setStatus('Estado actualizado');
  }

  async function deleteBooking(id) {
    if (!confirm('Eliminar este agendamento permanentemente? Esta acção não pode ser desfeita.')) {
      return;
    }
    if (CONFIG.workerUrl) {
      try {
        const res = await fetch(
          CONFIG.workerUrl.replace(/\/$/, '') + '/bookings/' + encodeURIComponent(id),
          {
            method: 'DELETE',
            headers: { 'X-Admin-Password': getPassword() }
          }
        );
        if (!res.ok && res.status !== 404) throw new Error('Falha ao eliminar');
      } catch (e) {
        setStatus('Erro ao eliminar: ' + e.message);
      }
    }
    const local = getLocalBookings().filter((b) => b.id !== id);
    localStorage.setItem(BOOKINGS_LOCAL, JSON.stringify(local));
    bookings = bookings.filter((b) => b.id !== id);
    renderBookings();
    updateDashboard();
    setStatus('Agendamento eliminado');
  }

  function updateDashboard() {
    const pending = orders.filter((o) => (o.status || 'pending') === 'pending').length;
    const bkPending = bookings.filter((b) => (b.status || 'pending') === 'pending').length;
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set('stat-pending', pending);
    set('stat-total', orders.length);
    set('stat-bookings-pending', bkPending);
    set('stat-bookings-total', bookings.length);
    set(
      'stat-products',
      (catalog.products || []).filter((p) => p.active !== false).length
    );
    set('stat-zones', (catalog.zones || []).filter((z) => z.active !== false).length);
  }

  function formatPrice(v) {
    return Number(v || 0).toLocaleString('pt-AO') + ' ' + (catalog.currency || 'Kz');
  }
  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('pt-AO');
    } catch (_) {
      return iso;
    }
  }
  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }
  function escapeAttr(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  /* ——— Products ——— */
  function sortedProducts() {
    return (catalog.products || [])
      .slice()
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  function filteredProducts() {
    const q = productSearch.trim().toLowerCase();
    const list = sortedProducts();
    if (!q) return list;
    return list.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.nameEn || '').toLowerCase().includes(q)
    );
  }

  function findProductIndex(id) {
    return (catalog.products || []).findIndex((p) => p.id === id);
  }

  function renumberOrders() {
    sortedProducts().forEach((p, i) => {
      p.order = i + 1;
    });
  }

  function productThumb(p) {
    if (p.image) {
      return `<img class="product-card__thumb" src="${escapeAttr(p.image)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.hidden=false)">
        <div class="product-card__thumb product-card__thumb--empty" hidden>sem img</div>`;
    }
    return `<div class="product-card__thumb product-card__thumb--empty">sem img</div>`;
  }

  function renderProductsEditor() {
    const el = document.getElementById('products-editor');
    if (!el) return;

    const list = filteredProducts();

    if (!list.length) {
      el.innerHTML = productSearch.trim()
        ? `<div class="empty-state">Nenhum produto corresponde à pesquisa.</div>`
        : `<div class="empty-state">Ainda não há produtos. Clique em <strong>+ Produto</strong>.</div>`;
      return;
    }

    el.innerHTML = `<div class="product-list">${list
      .map((p) => {
        const isEditing = editingProductId === p.id;
        const active = p.active !== false;
        return `
      <div class="product-card${isEditing ? ' is-editing' : ''}" data-id="${escapeAttr(p.id)}" draggable="false">
        <div class="product-card__summary">
          <span class="product-card__drag" title="Arrastar para reordenar" draggable="true" data-drag-handle>⋮⋮</span>
          ${productThumb(p)}
          <div class="product-card__info">
            <div class="product-card__name">${escapeHtml(p.name || 'Sem nome')}</div>
            <div class="product-card__meta">
              <span class="product-card__price">${Number(p.price || 0).toLocaleString('pt-AO')} Kz</span>
              <span class="product-badge ${active ? 'product-badge--on' : 'product-badge--off'}">${
                active ? 'Activo' : 'Inactivo'
              }</span>
            </div>
          </div>
          <div class="product-card__actions">
            <label class="product-toggle" title="Activo na loja">
              <input type="checkbox" data-action="toggle-active" ${active ? 'checked' : ''}>
              <span>Loja</span>
            </label>
            <button type="button" class="btn-edit${isEditing ? ' is-active' : ''}" data-action="edit">${
              isEditing ? 'Fechar' : 'Editar'
            }</button>
            <button type="button" class="btn-dup" data-action="duplicate" title="Duplicar">Dup</button>
            <button type="button" class="btn-remove" data-action="remove">Remover</button>
          </div>
        </div>
        ${
          isEditing
            ? `
        <div class="product-card__editor">
          <label>Nome <input type="text" data-field="name" value="${escapeAttr(p.name)}"></label>
          <label>Preço (Kz) <input type="number" data-field="price" value="${p.price}" min="0" step="50"></label>
          <label>Preço no site (texto) <input type="text" data-field="priceLabel" value="${escapeAttr(p.priceLabel || '')}" placeholder="Consultar preço / 9.600 Kz"></label>
          <label>Descrição <textarea data-field="description" rows="2">${escapeHtml(
            p.description || ''
          )}</textarea></label>
          <label>Imagem (URL) <input type="text" data-field="image" value="${escapeAttr(
            p.image || ''
          )}"></label>
          <div class="image-field">
            <button type="button" class="tool-btn" data-action="upload-image">Carregar imagem</button>
            <input type="file" class="product-file" accept="image/*" hidden>
          </div>
          ${p.image ? `<img class="preview-img" src="${escapeAttr(p.image)}" alt="">` : ''}
          <div class="product-card__editor-actions">
            <button type="button" class="btn-done" data-action="done">Concluído</button>
          </div>
        </div>`
            : ''
        }
      </div>`;
      })
      .join('')}</div>`;

    bindProductListEvents(el);
  }

  function bindProductListEvents(el) {
    el.querySelectorAll('.product-card').forEach((card) => {
      const id = card.dataset.id;

      // Summary / editor actions
      card.querySelectorAll('[data-action]').forEach((btn) => {
        const action = btn.dataset.action;
        if (action === 'toggle-active') {
          btn.addEventListener('change', () => {
            const idx = findProductIndex(id);
            if (idx >= 0) {
              catalog.products[idx].active = btn.checked;
              // Update badge in place without full re-render when possible
              const badge = card.querySelector('.product-badge');
              if (badge) {
                badge.textContent = btn.checked ? 'Activo' : 'Inactivo';
                badge.classList.toggle('product-badge--on', btn.checked);
                badge.classList.toggle('product-badge--off', !btn.checked);
              }
              updateDashboard();
            }
          });
          return;
        }
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (action === 'edit') {
            editingProductId = editingProductId === id ? null : id;
            renderProductsEditor();
          } else if (action === 'done') {
            editingProductId = null;
            renderProductsEditor();
          } else if (action === 'remove') {
            if (!confirm('Remover este produto?')) return;
            const idx = findProductIndex(id);
            if (idx >= 0) {
              catalog.products.splice(idx, 1);
              if (editingProductId === id) editingProductId = null;
              renumberOrders();
              renderProductsEditor();
              updateDashboard();
            }
          } else if (action === 'duplicate') {
            duplicateProduct(id);
          } else if (action === 'upload-image') {
            const fileInput = card.querySelector('.product-file');
            fileInput?.click();
          }
        });
      });

      const productFile = card.querySelector('.product-file');
      productFile?.addEventListener('change', async () => {
        const file = productFile.files?.[0];
        if (!file) return;
        const idx = findProductIndex(id);
        if (idx < 0) return;
        try {
          setStatus('A enviar imagem…');
          const data = await uploadMedia(file);
          catalog.products[idx].image = data.secure_url;
          mediaLibrary.unshift({ url: data.secure_url });
          setStatus('Imagem actualizada — Guardar / Publicar');
          renderProductsEditor();
        } catch (err) {
          setStatus('Erro no envio: ' + err.message);
        }
        productFile.value = '';
      });

      // Field changes while editing
      card.querySelectorAll('[data-field]').forEach((input) => {
        const apply = () => {
          const idx = findProductIndex(id);
          if (idx < 0) return;
          const field = input.dataset.field;
          if (field === 'price') catalog.products[idx].price = Number(input.value);
          else catalog.products[idx][field] = input.value;
          // Live-update summary name/price without full re-render while typing
          if (field === 'name') {
            const nameEl = card.querySelector('.product-card__name');
            if (nameEl) nameEl.textContent = input.value || 'Sem nome';
          }
          if (field === 'price') {
            const priceEl = card.querySelector('.product-card__price');
            if (priceEl)
              priceEl.textContent =
                Number(input.value || 0).toLocaleString('pt-AO') + ' Kz';
          }
          if (field === 'image') {
            const thumbWrap = card.querySelector('.product-card__summary');
            const oldThumb = thumbWrap?.querySelector('.product-card__thumb');
            if (oldThumb && input.value) {
              if (oldThumb.tagName === 'IMG') {
                oldThumb.src = input.value;
              } else {
                // replace placeholder with img on next full render
              }
            }
          }
        };
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      });

      // Drag handle
      const handle = card.querySelector('[data-drag-handle]');
      if (handle) {
        handle.addEventListener('dragstart', (e) => {
          dragProductId = id;
          card.classList.add('is-dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', id);
        });
        handle.addEventListener('dragend', () => {
          dragProductId = null;
          card.classList.remove('is-dragging');
          el.querySelectorAll('.product-card').forEach((c) =>
            c.classList.remove('is-drag-over')
          );
        });
      }

      card.addEventListener('dragover', (e) => {
        if (!dragProductId || dragProductId === id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        card.classList.add('is-drag-over');
      });
      card.addEventListener('dragleave', () => {
        card.classList.remove('is-drag-over');
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('is-drag-over');
        const fromId = dragProductId || e.dataTransfer.getData('text/plain');
        if (!fromId || fromId === id) return;
        reorderProduct(fromId, id);
      });
    });
  }

  function reorderProduct(fromId, toId) {
    const products = catalog.products || [];
    const fromIdx = findProductIndex(fromId);
    const toIdx = findProductIndex(toId);
    if (fromIdx < 0 || toIdx < 0) return;

    // Work on sorted order, then write back
    const ordered = sortedProducts();
    const fromSorted = ordered.findIndex((p) => p.id === fromId);
    const toSorted = ordered.findIndex((p) => p.id === toId);
    if (fromSorted < 0 || toSorted < 0) return;

    const [item] = ordered.splice(fromSorted, 1);
    ordered.splice(toSorted, 0, item);
    ordered.forEach((p, i) => {
      p.order = i + 1;
    });
    // Keep array reference; order fields are enough for sortedProducts()
    renderProductsEditor();
  }

  function duplicateProduct(id) {
    const idx = findProductIndex(id);
    if (idx < 0) return;
    const src = catalog.products[idx];
    const copy = {
      ...structuredClone(src),
      id: 'p_' + Date.now(),
      name: (src.name || 'Produto') + ' (cópia)',
      order: (src.order || 0) + 0.5
    };
    catalog.products.push(copy);
    renumberOrders();
    editingProductId = copy.id;
    renderProductsEditor();
    updateDashboard();
  }

  function addProduct() {
    const nextOrder =
      (catalog.products || []).reduce((m, p) => Math.max(m, p.order || 0), 0) + 1;
    const neo = {
      id: 'p_' + Date.now(),
      name: 'Novo produto',
      price: 1500,
      description: '',
      image: '',
      active: true,
      stock: true,
      category: 'chocolate',
      order: nextOrder
    };
    catalog.products.push(neo);
    editingProductId = neo.id;
    productSearch = '';
    const searchInput = document.getElementById('product-search');
    if (searchInput) searchInput.value = '';
    renderProductsEditor();
    updateDashboard();
    // Scroll new card into view
    requestAnimationFrame(() => {
      document
        .querySelector(`.product-card[data-id="${neo.id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  /* ——— Zones ——— */
  function renderZonesEditor() {
    const el = document.getElementById('zones-editor');
    if (!el) return;
    el.innerHTML = (catalog.zones || [])
      .map(
        (z, idx) => `
      <div class="editor-card editor-card--row" data-idx="${idx}">
        <input type="text" data-field="name" value="${escapeAttr(z.name)}" placeholder="Zona">
        <input type="number" data-field="fee" value="${z.fee || 0}" min="0" step="100" title="Taxa Kz">
        <label class="check"><input type="checkbox" data-field="active" ${
          z.active !== false ? 'checked' : ''
        }> Activa</label>
        <button type="button" class="btn-remove remove-zone">×</button>
      </div>`
      )
      .join('');

    el.querySelectorAll('.editor-card').forEach((card) => {
      const idx = Number(card.dataset.idx);
      card.querySelectorAll('[data-field]').forEach((input) => {
        input.addEventListener('change', () => {
          const field = input.dataset.field;
          if (field === 'active') catalog.zones[idx].active = input.checked;
          else if (field === 'fee') catalog.zones[idx].fee = Number(input.value);
          else catalog.zones[idx][field] = input.value;
        });
      });
      card.querySelector('.remove-zone')?.addEventListener('click', () => {
        catalog.zones.splice(idx, 1);
        renderZonesEditor();
        updateDashboard();
      });
    });
  }

  function addZone() {
    catalog.zones.push({
      id: 'z_' + Date.now(),
      name: 'Nova zona',
      fee: 500,
      active: true
    });
    renderZonesEditor();
    updateDashboard();
  }

  /* ——— Site content editor ——— */
  function ensureSite() {
    if (!catalog.site) catalog.site = structuredClone(DEFAULTS.site || {});
  }

  const CONTENT_FIELDS = [
    { group: 'Anúncio', fields: [
      { key: 'announceText', label: 'Texto do anúncio' },
      { key: 'announceHref', label: 'Link do anúncio' }
    ]},
    { group: 'Hero', fields: [
      { key: 'heroEyebrow', label: 'Linha superior' },
      { key: 'heroTitle', label: 'Título (use \\n para quebra de linha)', multiline: true },
      { key: 'heroSubtitle', label: 'Subtítulo', multiline: true },
      { key: 'heroImage', label: 'Imagem de fundo', image: true }
    ]},
    { group: 'Manifesto', fields: [
      { key: 'manifestoQuote', label: 'Citação', multiline: true },
      { key: 'manifestoAttr', label: 'Atribuição' }
    ]},
    { group: 'Secções', fields: [
      { key: 'servicesEyebrow', label: 'Serviços — eyebrow' },
      { key: 'servicesTitle', label: 'Serviços — título' },
      { key: 'servicesNote', label: 'Serviços — nota' },
      { key: 'experienceEyebrow', label: 'Experiência — eyebrow' },
      { key: 'experienceTitle', label: 'Experiência — título' },
      { key: 'galleryEyebrow', label: 'Galeria — eyebrow' },
      { key: 'galleryTitle', label: 'Galeria — título' },
      { key: 'bookingEyebrow', label: 'Agendar — eyebrow' },
      { key: 'bookingTitle', label: 'Agendar — título' },
      { key: 'minibarEyebrow', label: 'Mini-Bar — eyebrow' },
      { key: 'minibarTitle', label: 'Mini-Bar — título' },
      { key: 'minibarIntro', label: 'Mini-Bar — intro' },
      { key: 'minibarCardImage', label: 'Mini-Bar — imagem do cartão', image: true }
    ]},
    { group: 'Confiança', fields: [
      { key: 'trust1Value', label: 'Item 1 — valor' },
      { key: 'trust1Label', label: 'Item 1 — etiqueta' },
      { key: 'trust2Value', label: 'Item 2 — valor' },
      { key: 'trust2Label', label: 'Item 2 — etiqueta' },
      { key: 'trust3Value', label: 'Item 3 — valor' },
      { key: 'trust3Label', label: 'Item 3 — etiqueta' },
      { key: 'trust4Value', label: 'Item 4 — valor' },
      { key: 'trust4Label', label: 'Item 4 — etiqueta' },
      { key: 'trust4Href', label: 'Item 4 — link' }
    ]},
    { group: 'Rodapé & contacto', fields: [
      { key: 'footerPhone', label: 'Telefone' },
      { key: 'footerAddress', label: 'Morada' },
      { key: 'footerHours', label: 'Horário' },
      { key: 'footerCopy', label: 'Copyright' },
      { key: 'instagram', label: 'Instagram URL' },
      { key: 'facebook', label: 'Facebook URL' },
      { key: 'whatsapp', label: 'WhatsApp (código país + número)' },
      { key: 'logo', label: 'Logo', image: true }
    ]}
  ];

  function renderContentEditor() {
    ensureSite();
    const el = document.getElementById('content-editor');
    if (!el) return;
    el.innerHTML = CONTENT_FIELDS.map((group) => `
      <div class="content-group">
        <h3 class="content-group__title">${group.group}</h3>
        ${group.fields
          .map((f) => {
            const val = catalog.site[f.key] ?? '';
            if (f.image) {
              return `<div class="content-field content-field--image">
                <label>${f.label}
                  <input type="text" data-ckey="${f.key}" value="${escapeAttr(String(val))}">
                </label>
                <button type="button" class="tool-btn upload-content-img" data-ckey="${f.key}">Carregar</button>
                <input type="file" class="content-file" data-ckey="${f.key}" accept="image/*" hidden>
                ${val ? `<img class="preview-img" src="${escapeAttr(String(val))}" alt="">` : ''}
              </div>`;
            }
            if (f.multiline) {
              return `<label class="content-field">${f.label}
                <textarea data-ckey="${f.key}" rows="2">${escapeHtml(String(val))}</textarea>
              </label>`;
            }
            return `<label class="content-field">${f.label}
              <input type="text" data-ckey="${f.key}" value="${escapeAttr(String(val))}">
            </label>`;
          })
          .join('')}
      </div>`).join('');

    el.querySelectorAll('[data-ckey]').forEach((input) => {
      if (input.type === 'file') return;
      input.addEventListener('change', () => {
        catalog.site[input.dataset.ckey] = input.value;
      });
    });
    el.querySelectorAll('.upload-content-img').forEach((btn) => {
      btn.addEventListener('click', () => {
        el.querySelector(`.content-file[data-ckey="${btn.dataset.ckey}"]`)?.click();
      });
    });
    el.querySelectorAll('.content-file').forEach((fileInput) => {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const key = fileInput.dataset.ckey;
        try {
          setStatus('A enviar imagem…');
          const data = await uploadMedia(file);
          catalog.site[key] = data.secure_url;
          mediaLibrary.unshift({ url: data.secure_url });
          setStatus('Imagem actualizada — Guardar / Publicar');
          renderContentEditor();
        } catch (e) {
          setStatus('Erro no envio: ' + e.message);
        }
        fileInput.value = '';
      });
    });
  }

  /* ——— Gallery editor ——— */
  function ensureGallery() {
    if (!Array.isArray(catalog.gallery)) catalog.gallery = structuredClone(DEFAULTS.gallery || []);
  }

  function renderGalleryEditor() {
    ensureGallery();
    const el = document.getElementById('gallery-editor');
    if (!el) return;
    el.innerHTML = (catalog.gallery || [])
      .map(
        (g, idx) => `
      <div class="gallery-edit-card" data-gid="${g.id}">
        <img src="${escapeAttr(g.image || '')}" alt="" onerror="this.style.opacity=0.2">
        <label>Alt <input type="text" data-gfield="alt" value="${escapeAttr(g.alt || '')}"></label>
        <label>URL <input type="text" data-gfield="image" value="${escapeAttr(g.image || '')}"></label>
        <div class="gallery-edit-actions">
          <button type="button" class="tool-btn upload-gallery-img">Carregar</button>
          <input type="file" class="gallery-file" accept="image/*" hidden>
          <button type="button" class="tool-btn tool-btn--danger remove-gallery">Remover</button>
        </div>
      </div>`
      )
      .join('');

    el.querySelectorAll('.gallery-edit-card').forEach((card) => {
      const id = card.dataset.gid;
      const idx = catalog.gallery.findIndex((x) => x.id === id);
      if (idx < 0) return;
      card.querySelectorAll('[data-gfield]').forEach((input) => {
        input.addEventListener('change', () => {
          catalog.gallery[idx][input.dataset.gfield] = input.value;
        });
      });
      const fileInput = card.querySelector('.gallery-file');
      card.querySelector('.upload-gallery-img')?.addEventListener('click', () => fileInput?.click());
      fileInput?.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        try {
          setStatus('A enviar imagem…');
          const data = await uploadMedia(file);
          catalog.gallery[idx].image = data.secure_url;
          mediaLibrary.unshift({ url: data.secure_url });
          setStatus('Imagem actualizada — Guardar / Publicar');
          renderGalleryEditor();
        } catch (e) {
          setStatus('Erro no envio: ' + e.message);
        }
        fileInput.value = '';
      });
      card.querySelector('.remove-gallery')?.addEventListener('click', () => {
        catalog.gallery.splice(idx, 1);
        renderGalleryEditor();
      });
    });
  }

  function addGalleryItem() {
    ensureGallery();
    catalog.gallery.push({
      id: 'g_' + Date.now(),
      image: '',
      alt: ''
    });
    renderGalleryEditor();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /* ——— Images upload (unsigned; no vendor name in UI) ——— */
  async function uploadMedia(file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CONFIG.unsignedPreset);
    fd.append('folder', CONFIG.catalogFolder);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.cloudName}/image/upload`,
      { method: 'POST', body: fd }
    );
    if (!res.ok) throw new Error('Falha no envio');
    return res.json();
  }

  function setupMedia() {
    const input = document.getElementById('media-input');
    if (!input) return;
    input.addEventListener('change', async () => {
      for (const file of [...input.files]) {
        try {
          setStatus('A enviar ' + file.name + '…');
          const data = await uploadMedia(file);
          mediaLibrary.unshift({ url: data.secure_url });
          renderMedia();
          setStatus('Imagem pronta — copie o link para o produto');
        } catch (e) {
          setStatus('Erro no envio: ' + e.message);
        }
      }
      input.value = '';
    });
  }

  function renderMedia() {
    const list = document.getElementById('media-list');
    if (!list) return;
    list.innerHTML = mediaLibrary
      .map(
        (m) => `
      <div class="media-item">
        <img src="${m.url}" alt="">
        <button type="button" data-url="${m.url}" class="copy-url">Copiar link</button>
      </div>`
      )
      .join('');
    list.querySelectorAll('.copy-url').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.url);
          setStatus('Link copiado');
        } catch (_) {
          setStatus(btn.dataset.url);
        }
      });
    });
  }

  /* ——— UI chrome ——— */
  function setStatus(msg) {
    const el = document.getElementById('admin-status');
    if (el) el.textContent = msg || '';
  }

  function showApp() {
    document.getElementById('login-screen')?.classList.add('is-hidden');
    document.getElementById('admin-app')?.classList.remove('is-hidden');
    boot();
  }

  function switchTab(tab) {
    document.querySelectorAll('[data-tab]').forEach((b) => b.classList.remove('is-active'));
    document.querySelectorAll('[data-panel]').forEach((p) => p.classList.remove('is-active'));
    document.querySelector(`.nav-item[data-tab="${tab}"]`)?.classList.add('is-active');
    document.querySelector(`[data-panel="${tab}"]`)?.classList.add('is-active');
    const title = document.getElementById('page-title');
    if (title) title.textContent = TITLES[tab] || tab;
    if (tab === 'orders' || tab === 'dashboard') loadOrders();
    if (tab === 'bookings' || tab === 'dashboard') loadBookings();
    if (tab === 'content') renderContentEditor();
    if (tab === 'gallery') renderGalleryEditor();
    if (tab === 'products') renderProductsEditor();
    if (tab === 'zones') renderZonesEditor();
    closeSidebar();
  }

  function openSidebar() {
    document.getElementById('sidebar')?.classList.add('is-open');
    document.getElementById('sidebar-overlay')?.classList.add('is-open');
  }
  function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('is-open');
    document.getElementById('sidebar-overlay')?.classList.remove('is-open');
  }

  async function boot() {
    document.querySelectorAll('.nav-item[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    document.querySelectorAll('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.goto));
    });
    document.getElementById('sidebar-toggle')?.addEventListener('click', openSidebar);
    document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

    document.querySelectorAll('#orders-filters .filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#orders-filters .filter-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        orderFilter = chip.dataset.filter;
        renderOrders();
      });
    });

    document.querySelectorAll('#bookings-filters .filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#bookings-filters .filter-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        bookingFilter = chip.dataset.bkFilter;
        renderBookings();
      });
    });

    setupMedia();
    await loadLiveCatalog();
    ensureSite();
    ensureGallery();
    renderProductsEditor();
    renderContentEditor();
    renderGalleryEditor();
    renderZonesEditor();
    await loadOrders();
    await loadBookings();

    document.getElementById('btn-save-draft')?.addEventListener('click', saveDraft);
    document.getElementById('btn-publish')?.addEventListener('click', publish);
    document.getElementById('btn-logout')?.addEventListener('click', logout);
    document.getElementById('btn-refresh-orders')?.addEventListener('click', loadOrders);
    document.getElementById('btn-refresh-bookings')?.addEventListener('click', loadBookings);
    document.getElementById('add-product-btn')?.addEventListener('click', addProduct);
    document.getElementById('add-gallery-btn')?.addEventListener('click', addGalleryItem);
    document.getElementById('add-zone-btn')?.addEventListener('click', addZone);

    const productSearchInput = document.getElementById('product-search');
    if (productSearchInput) {
      productSearchInput.addEventListener('input', () => {
        productSearch = productSearchInput.value;
        renderProductsEditor();
      });
    }
  }

  /* ——— Login screen ——— */
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('password-toggle');
    const pwInput = document.getElementById('login-password');
    if (toggle && pwInput) {
      toggle.addEventListener('click', () => {
        const show = pwInput.type === 'password';
        pwInput.type = show ? 'text' : 'password';
        toggle.querySelector('.icon-eye')?.classList.toggle('is-hidden', show);
        toggle.querySelector('.icon-eye-off')?.classList.toggle('is-hidden', !show);
        toggle.setAttribute('aria-label', show ? 'Ocultar password' : 'Mostrar password');
      });
    }

    if (isLoggedIn() && getPassword()) {
      verifyPassword(getPassword()).then((result) => {
        if (result.ok) showApp();
        else {
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(PW_KEY);
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(PW_KEY);
          localStorage.removeItem(REMEMBER_KEY);
          if (result.reason === 'unauthorized') {
            showLoginError('Sessão inválida — introduza a password correcta');
          }
        }
      });
      return;
    }

    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const pw = form.password.value;
      if (!pw) return;
      const remember = document.getElementById('remember-me')?.checked;
      const btn = form.querySelector('[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'A verificar…';
      }
      showLoginError('');
      try {
        await login(pw, remember);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Entrar';
        }
      }
    });
  });
})();
