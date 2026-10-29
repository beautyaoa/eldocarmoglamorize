# Site + Admin Blueprint (Eldo Carmo Glamorize)

**Stack**  
HTML/CSS/JS (no framework) · Cloudflare Pages · Cloudflare Worker (publish + orders + secrets) · Cloudinary (unsigned media + signed `catalog.json`) · Cloudflare KV (orders) · localStorage (drafts only)

**Folders**  
`index.html` · `admin.html` · `css/` · `js/` (products.js, main.js, admin.js) · `assets/` · `worker/` · `BLUEPRINT.md`

**Live data**  
`catalog.json` on Cloudinary:  
`https://res.cloudinary.com/gyssk0cm/raw/upload/glamorize/catalog.json`

**Public site load order**  
1. `products.js` defaults  
2. Optional localStorage cache  
3. Fetch remote catalog (`?t=` + `no-store`) → merge over defaults  
4. Cart / booking in localStorage · Checkout → `POST /order` → KV → Admin

**Admin (critical pattern)**  
On load/login:  
1. Start from `products.js` defaults  
2. Fetch live catalog → **overwrite localStorage** if remote succeeds  
3. Fallback to localStorage only if remote fails  

| Area | Draft (this browser) | Publish |
|------|----------------------|---------|
| Services / products / zones / texts / images | localStorage draft | `catalog.json` |
| Orders / bookings | — | KV via Worker |
| Media library | local only | not published as list |

**Buttons**  
- Guardar rascunho → localStorage only  
- Publicar na loja → POST `{password, catalog}` to Worker → signed Cloudinary upload → sync localStorage  

**Worker**  
Secrets: `ADMIN_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`  
KV binding: `ORDERS`  
Routes: `/publish` · `/order` · `/orders` · `PATCH /orders/:id` · `DELETE /orders/:id`

**Orders**  
No WhatsApp. Customer submits form → Worker stores in KV → staff manages status in admin (pending / confirmed / delivered / cancelled).

**Currency**  
Kz

**Cloudinary**  
- Cloud: `gyssk0cm`  
- Unsigned preset: `glamorize_unsigned` (browser media)  
- API key/secret → Worker only  
- Folder: `glamorize` · catalog public_id: `glamorize/catalog`

**Deploy checklist**  
- [ ] Create GitHub repo + Cloudflare Pages (root = this folder or `glamorize/`)  
- [ ] Create KV namespace · put id in `worker/wrangler.toml`  
- [ ] `npx wrangler secret put ADMIN_PASSWORD` (value: set by owner)  
- [ ] `npx wrangler secret put CLOUDINARY_CLOUD_NAME` → `gyssk0cm`  
- [ ] `npx wrangler secret put CLOUDINARY_API_KEY`  
- [ ] `npx wrangler secret put CLOUDINARY_API_SECRET`  
- [ ] Deploy Worker · set `GLAMORIZE_CONFIG.workerUrl` in `js/products.js`  
- [ ] Open admin → Publicar na loja (creates first catalog.json)  
- [ ] Test order/booking on public site → appears in Admin → Encomendas  

**Never** put API secret or admin password in frontend or git.
