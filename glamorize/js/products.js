/**
 * Eldo Carmo Glamorize — Default catalog (overridden by live Cloudinary catalog.json)
 * Currency: Kz · Orders / appointments → Cloudflare Worker → KV → Admin panel
 * Staff edit texts, services, gallery & images in Admin → Guardar → Publicar
 */

window.GLAMORIZE_DEFAULTS = {
  updatedAt: null,
  currency: 'Kz',
  /* Products tab + homepage services (same list) */
  products: [
    {
      id: 'manicure',
      name: 'Manicure',
      nameEn: 'Manicure',
      description: 'Cuidado completo das unhas das mãos com acabamento impecável.',
      descriptionEn: 'Complete care for the hands with an impeccable finish.',
      price: 0,
      priceLabel: 'Consultar preço',
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
      priceLabel: 'Consultar preço',
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
      priceLabel: 'Consultar preço',
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
      priceLabel: 'Consultar preço',
      image: 'assets/images/service-sobrancelhas.webp',
      category: 'rosto',
      active: true,
      stock: true,
      order: 4
    },
    {
      id: 'facial',
      name: 'Tratamentos Faciais',
      nameEn: 'Facial Treatments',
      description: 'Limpeza e cuidados para uma pele radiante.',
      descriptionEn: 'Cleansing and care for radiant skin.',
      price: 0,
      priceLabel: 'Consultar preço',
      image: 'assets/images/service-facial.webp',
      category: 'rosto',
      active: true,
      stock: true,
      order: 5
    },
    {
      id: 'maquilhagem',
      name: 'Maquilhagem',
      nameEn: 'Makeup',
      description: 'Para ocasiões especiais ou o dia a dia com elegância.',
      descriptionEn: 'For special occasions or everyday elegance.',
      price: 0,
      priceLabel: 'Consultar preço',
      image: 'assets/images/service-maquilhagem.webp',
      category: 'rosto',
      active: true,
      stock: true,
      order: 6
    },
    {
      id: 'trancas',
      name: 'Lavagem + Tranças',
      nameEn: 'Wash + Braids',
      description: 'Lavagem com massagem e tranças profissionais — para princesas de todas as idades.',
      descriptionEn: 'Wash with massage and professional braids — for princesses of all ages.',
      price: 9600,
      priceLabel: '9.600 Kz',
      image: 'assets/images/service-trancas.webp',
      category: 'cabelo',
      active: true,
      stock: true,
      order: 7
    }
  ],
  /* Alias: homepage uses services; kept in sync with products on publish */
  services: null,
  gallery: [
    { id: 'g1', image: 'assets/images/gallery/gallery-1.webp', alt: 'Trabalho Glamorize' },
    { id: 'g2', image: 'assets/images/gallery/gallery-2.webp', alt: 'Trabalho Glamorize' },
    { id: 'g3', image: 'assets/images/gallery/gallery-3.webp', alt: 'Trabalho Glamorize' },
    { id: 'g4', image: 'assets/images/gallery/gallery-4.webp', alt: 'Trabalho Glamorize' },
    { id: 'g5', image: 'assets/images/gallery/gallery-5.webp', alt: 'Penteado com elásticos e coque para criança' },
    { id: 'g6', image: 'assets/images/gallery/gallery-6.webp', alt: 'Coque baixo com baby hair' },
    { id: 'g7', image: 'assets/images/gallery/gallery-7.webp', alt: 'Tranças infantis com detalhes em fio rosa' }
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
  site: {
    announceText: 'Já disponível — música Tá Queimar 🔥🔥🔥 · Ouvir no YouTube',
    announceHref: 'https://youtu.be/6vzUPh26JZA?si=xl3FzxXKTsRD6NoC',
    heroEyebrow: 'Beleza & Estética · Luanda',
    heroTitle: 'Elegância\nque se sente',
    heroSubtitle: 'Tratamentos premium pensados para realçar a sua beleza natural.',
    heroImage: '',
    manifestoQuote: '',
    manifestoAttr: '',
    servicesEyebrow: 'O que fazemos',
    servicesTitle: 'Serviços',
    servicesNote: '* Preços indicativos. Contacte-nos para confirmação e outros serviços.',
    experienceEyebrow: 'Por dentro',
    experienceTitle: 'A Experiência Glamorize',
    galleryEyebrow: 'Trabalhos',
    galleryTitle: 'Galeria',
    bookingEyebrow: 'Reservas',
    bookingTitle: 'Agendar sessão',
    lubangoEyebrow: 'Expansão',
    lubangoTitle: 'Lubango — Estamos a chegar',
    lubangoText: 'A Eldo Carmo está a reforçar a sua equipa no Lubango e quer contar contigo.',
    lubangoLocation: 'Bairro Lucrécia, Lubango',
    lubangoEmail: 'recrutamento.eldocarmo@gmail.com',
    lubangoWhatsapp: '924 071 971',
    lubangoImage: 'assets/images/lubango.webp',
    trust1Value: '',
    trust1Label: '',
    trust2Value: '',
    trust2Label: '',
    trust3Value: '',
    trust3Label: '',
    trust4Value: '@glamorize_by_eldocarmo',
    trust4Label: 'Instagram',
    trust4Href: 'https://www.instagram.com/glamorize_by_eldocarmo/',
    footerPhone: '',
    footerAddress: 'Luanda',
    footerHours: '',
    footerCopy: '© 2026 Eldo Carmo Glamorize. Todos os direitos reservados.',
    instagram: 'https://www.instagram.com/glamorize_by_eldocarmo/',
    facebook: 'https://www.facebook.com/EldoCarmoBeleza',
    whatsapp: '244924071971',
    logo: 'assets/images/eldocarmoglamorizelogo.webp'
  },
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

window.GLAMORIZE_CONFIG = {
  cloudName: 'gyssk0cm',
  unsignedPreset: 'glamorize_unsigned',
  catalogFolder: 'glamorize',
  catalogPublicId: 'glamorize/catalog',
  workerUrl: 'https://eldocarmoglamorize-api.beautyaoa.workers.dev',
  get catalogUrl() {
    return `https://res.cloudinary.com/${this.cloudName}/raw/upload/${this.catalogFolder}/catalog.json`;
  }
};
