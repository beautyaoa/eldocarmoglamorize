/**
 * Eldo Carmo Glamorize API Worker
 * Secrets (wrangler secret put):
 *   ADMIN_PASSWORD
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 * KV binding: ORDERS
 *
 * Routes:
 *   POST /publish          { password, catalog } → Cloudinary catalog.json
 *   POST /order            order object → KV
 *   GET  /orders           X-Admin-Password → list
 *   PATCH /orders/:id      { status } + password
 *   DELETE /orders/:id     password → remove from KV + index
 *   POST /booking          booking object → KV (__bookings_index)
 *   GET  /bookings         X-Admin-Password → list
 *   PATCH /bookings/:id    { status } + password
 *   DELETE /bookings/:id   password → remove from KV + index
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

function unauthorized() {
  return json({ error: 'Unauthorized' }, 401);
}

async function sha1Hex(message) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Signed Cloudinary raw upload (overwrite catalog.json) */
async function uploadCatalog(env, catalog) {
  const cloud = env.CLOUDINARY_CLOUD_NAME;
  const key = env.CLOUDINARY_API_KEY;
  const secret = env.CLOUDINARY_API_SECRET;
  const publicId = 'glamorize/catalog';
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'glamorize';

  // signature: folder=...&overwrite=true&public_id=...&timestamp=... + secret
  const toSign = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${secret}`;
  const signature = await sha1Hex(toSign);

  const body = JSON.stringify(catalog, null, 2);
  const form = new FormData();
  form.append('file', new Blob([body], { type: 'application/json' }), 'catalog.json');
  form.append('api_key', key);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('public_id', publicId);
  form.append('folder', folder);
  form.append('overwrite', 'true');
  form.append('resource_type', 'raw');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/raw/upload`, {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }
  return data;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    try {
      // ——— PUBLISH CATALOG ———
      if (path === '/publish' && request.method === 'POST') {
        const body = await request.json();
        if (!body.password || body.password !== env.ADMIN_PASSWORD) return unauthorized();
        if (!body.catalog) return json({ error: 'Missing catalog' }, 400);
        const result = await uploadCatalog(env, body.catalog);
        return json({ ok: true, url: result.secure_url, public_id: result.public_id });
      }

      // ——— NEW ORDER ———
      if (path === '/order' && request.method === 'POST') {
        const order = await request.json();
        if (!order || !order.id || !order.customer) {
          return json({ error: 'Invalid order' }, 400);
        }
        order.status = order.status || 'pending';
        order.createdAt = order.createdAt || new Date().toISOString();
        await env.ORDERS.put(order.id, JSON.stringify(order));
        // Maintain index list
        let index = [];
        try {
          index = JSON.parse((await env.ORDERS.get('__index')) || '[]');
        } catch (_) {}
        index = [order.id, ...index.filter((id) => id !== order.id)].slice(0, 500);
        await env.ORDERS.put('__index', JSON.stringify(index));
        return json({ ok: true, id: order.id });
      }

      // ——— LIST ORDERS ———
      if (path === '/orders' && request.method === 'GET') {
        const pw = request.headers.get('X-Admin-Password') || '';
        if (pw !== env.ADMIN_PASSWORD) return unauthorized();
        let index = [];
        try {
          index = JSON.parse((await env.ORDERS.get('__index')) || '[]');
        } catch (_) {}
        const orders = [];
        for (const id of index) {
          const raw = await env.ORDERS.get(id);
          if (raw) {
            try {
              orders.push(JSON.parse(raw));
            } catch (_) {}
          }
        }
        return json(orders);
      }

      // ——— UPDATE ORDER STATUS ———
      const orderMatch = path.match(/^\/orders\/([^/]+)$/);
      if (orderMatch && request.method === 'PATCH') {
        const pw = request.headers.get('X-Admin-Password') || '';
        if (pw !== env.ADMIN_PASSWORD) return unauthorized();
        const id = decodeURIComponent(orderMatch[1]);
        const raw = await env.ORDERS.get(id);
        if (!raw) return json({ error: 'Not found' }, 404);
        const order = JSON.parse(raw);
        const body = await request.json();
        if (body.status) order.status = body.status;
        order.updatedAt = new Date().toISOString();
        await env.ORDERS.put(id, JSON.stringify(order));
        return json({ ok: true, order });
      }

      // ——— DELETE ORDER ———
      if (orderMatch && request.method === 'DELETE') {
        const pw = request.headers.get('X-Admin-Password') || '';
        if (pw !== env.ADMIN_PASSWORD) return unauthorized();
        const id = decodeURIComponent(orderMatch[1]);
        await env.ORDERS.delete(id);
        let index = [];
        try {
          index = JSON.parse((await env.ORDERS.get('__index')) || '[]');
        } catch (_) {}
        index = index.filter((x) => x !== id);
        await env.ORDERS.put('__index', JSON.stringify(index));
        return json({ ok: true, id });
      }

      // ——— NEW BOOKING ———
      if (path === '/booking' && request.method === 'POST') {
        const booking = await request.json();
        if (!booking || !booking.id || !booking.customer?.name || !booking.service || !booking.date || !booking.time) {
          return json({ error: 'Invalid booking' }, 400);
        }
        booking.type = 'booking';
        booking.status = booking.status || 'pending';
        booking.createdAt = booking.createdAt || new Date().toISOString();
        await env.ORDERS.put(booking.id, JSON.stringify(booking));
        let index = [];
        try {
          index = JSON.parse((await env.ORDERS.get('__bookings_index')) || '[]');
        } catch (_) {}
        index = [booking.id, ...index.filter((id) => id !== booking.id)].slice(0, 500);
        await env.ORDERS.put('__bookings_index', JSON.stringify(index));
        return json({ ok: true, id: booking.id });
      }

      // ——— LIST BOOKINGS ———
      if (path === '/bookings' && request.method === 'GET') {
        const pw = request.headers.get('X-Admin-Password') || '';
        if (pw !== env.ADMIN_PASSWORD) return unauthorized();
        let index = [];
        try {
          index = JSON.parse((await env.ORDERS.get('__bookings_index')) || '[]');
        } catch (_) {}
        const bookings = [];
        for (const id of index) {
          const raw = await env.ORDERS.get(id);
          if (raw) {
            try {
              bookings.push(JSON.parse(raw));
            } catch (_) {}
          }
        }
        return json(bookings);
      }

      // ——— UPDATE / DELETE BOOKING ———
      const bookingMatch = path.match(/^\/bookings\/([^/]+)$/);
      if (bookingMatch && request.method === 'PATCH') {
        const pw = request.headers.get('X-Admin-Password') || '';
        if (pw !== env.ADMIN_PASSWORD) return unauthorized();
        const id = decodeURIComponent(bookingMatch[1]);
        const raw = await env.ORDERS.get(id);
        if (!raw) return json({ error: 'Not found' }, 404);
        const booking = JSON.parse(raw);
        const body = await request.json();
        if (body.status) booking.status = body.status;
        booking.updatedAt = new Date().toISOString();
        await env.ORDERS.put(id, JSON.stringify(booking));
        return json({ ok: true, booking });
      }

      if (bookingMatch && request.method === 'DELETE') {
        const pw = request.headers.get('X-Admin-Password') || '';
        if (pw !== env.ADMIN_PASSWORD) return unauthorized();
        const id = decodeURIComponent(bookingMatch[1]);
        await env.ORDERS.delete(id);
        let index = [];
        try {
          index = JSON.parse((await env.ORDERS.get('__bookings_index')) || '[]');
        } catch (_) {}
        index = index.filter((x) => x !== id);
        await env.ORDERS.put('__bookings_index', JSON.stringify(index));
        return json({ ok: true, id });
      }

      return json({
        error: 'Not found',
        routes: ['/publish', '/order', '/orders', '/orders/:id', '/booking', '/bookings', '/bookings/:id']
      }, 404);
    } catch (e) {
      return json({ error: e.message || 'Server error' }, 500);
    }
  }
};
