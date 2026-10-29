/**
 * Eldo Carmo Glamorize — Default catalog (overridden by live Cloudinary catalog.json)
 * Currency: Kz · Orders / appointments → Cloudflare Worker → KV → Admin panel
 */

window.GLAMORIZE_DEFAULTS = {
  updatedAt: null,
  currency: 'Kz',
  products: [
    {
      id: 'manicure',
      name: 'Manicure',
      nameEn: 'Manicure',
      description: 'Cuidado completo das unhas das mãos com acabamento impecável.',
      descriptionEn: 'Complete care for the hands with an impeccable finish.',
      price: 0,
      image: 'assets/images/service-manicure.webp',
      category: 'unhas',
      active: true,
      stock: true,
      order: 1
    },
    {
      id: 'pedicure',
      name: 'Pedicure',
      nameEn: 'Pedicure',
      description: 'Tratamento relaxante e detalhado para os pés.',
      descriptionEn: 'Relaxing and detailed treatment for the feet.',
      price: 0,
      image: 'assets/images/service-pedicure.webp',
      category: 'unhas',
      active: true,
      stock: true,
      order: 2
    },
    {
      id: 'unhas-gel',
      name: 'Unhas de Gel / Acrílico',
      nameEn: 'Gel / Acrylic Nails',
      description: 'Alongamentos e designs personalizados com materiais premium.',
      descriptionEn: 'Extensions and custom designs with premium materials.',
      price: 0,
      image: 'assets/images/service-gel.webp',
      category: 'unhas',
      active: true,
      stock: true,
      order: 3
    },
    {
      id: 'sobrancelhas',
      name: 'Design de Sobrancelhas',
      nameEn: 'Eyebrow Design',
      description: 'Modelação e realce natural do olhar.',
      descriptionEn: 'Shaping and natural enhancement of the eyes.',
      price: 0,
      image: 'assets/images/service-sobrancelhas.webp',
      category: 'rosto',
      active: true,
      stock: true,
      order: 4
    },
    {
      id: 'maquilhagem',
      name: 'Maquilhagem',
      nameEn: 'Makeup',
      description: 'Maquilhagem profissional para eventos, noivas e dia a dia.',
      descriptionEn: 'Professional makeup for events, brides and everyday.',
      price: 0,
      image: 'assets/images/service-maquilhagem.webp',
      category: 'rosto',
      active: true,
      stock: true,
      order: 5
    },
    {
      id: 'facial',
      name: 'Tratamento Facial',
      nameEn: 'Facial Treatment',
      description: 'Limpeza e cuidados faciais para uma pele radiante.',
      descriptionEn: 'Cleansing and facial care for radiant skin.',
      price: 0,
      image: 'assets/images/service-facial.webp',
      category: 'rosto',
      active: true,
      stock: true,
      order: 6
    },
    {
      id: 'trancas',
      name: 'Tranças & Box Braids',
      nameEn: 'Braids & Box Braids',
      description: 'Tranças e penteados protectores com acabamento premium.',
      descriptionEn: 'Braids and protective styles with a premium finish.',
      price: 0,
      image: 'assets/images/service-trancas.webp',
      category: 'cabelo',
      active: true,
      stock: true,
      order: 7
    }
  ],
  zones: [
    { id: 'v17', name: 'V17 / Maianga', fee: 0, active: true },
    { id: 'ingombota', name: 'Ingombota', fee: 500, active: true },
    { id: 'samba', name: 'Samba', fee: 500, active: true },
    { id: 'rangel', name: 'Rangel', fee: 500, active: true },
    { id: 'sambizanga', name: 'Sambizanga', fee: 700, active: true },
    { id: 'cazenga', name: 'Cazenga', fee: 700, active: true },
    { id: 'kilamba', name: 'Kilamba', fee: 1000, active: true },
    { id: 'talatona', name: 'Talatona', fee: 1000, active: true },
    { id: 'belas', name: 'Belas', fee: 1000, active: true },
    { id: 'viana', name: 'Viana', fee: 1200, active: true },
    { id: 'cacuaco', name: 'Cacuaco', fee: 1200, active: true },
    { id: 'outro', name: 'Outra zona de Luanda', fee: 1500, active: true }
  ],
  texts: {
    pt: {
      heroTitle: 'Eldo Carmo Glamorize',
      heroSubtitle: 'Beleza & Estética premium em Luanda',
      shopCta: 'Ver serviços',
      cartEmpty: 'Nenhum serviço seleccionado',
      checkoutTitle: 'Agendar / Finalizar',
      orderSuccess: 'Pedido recebido! Entraremos em contacto em breve.',
      orderError: 'Não foi possível enviar o pedido. Tente novamente.'
    },
    en: {
      heroTitle: 'Eldo Carmo Glamorize',
      heroSubtitle: 'Premium beauty & aesthetics in Luanda',
      shopCta: 'View services',
      cartEmpty: 'No services selected',
      checkoutTitle: 'Book / Checkout',
      orderSuccess: 'Request received! We will contact you soon.',
      orderError: 'Could not submit the request. Please try again.'
    }
  },
  images: {
    logo: 'assets/images/eldocarmoglamorizelogo.webp',
    hero: 'assets/images/eldocarmoglamorizelogo.webp'
  }
};

/* ——— Config (public only — secrets live in Worker) ——— */
window.GLAMORIZE_CONFIG = {
  cloudName: 'gyssk0cm',
  unsignedPreset: 'glamorize_unsigned',
  catalogFolder: 'glamorize',
  catalogPublicId: 'glamorize/catalog',
  // Set after Worker is deployed:
  workerUrl: 'https://eldocarmoglamorize-api.<your-subdomain>.workers.dev',
  get catalogUrl() {
    return `https://res.cloudinary.com/${this.cloudName}/raw/upload/${this.catalogFolder}/catalog.json`;
  }
};
