import { mockShops } from '@/src/data/mockShops';
import { offerService } from '@/src/services/offerService';
import { useAppStore } from '@/src/store/appStore';
import { useAuthStore } from '@/src/store/authStore';
import { useShopStore } from '@/src/store/shopStore';
import { Offer, ShopCategory, ShopProfile } from '@/src/types';
import { categoryToMapIcon } from '@/src/utils/shop';
import { categoryToTopCategory, getDefaultMapIconForCategory } from '@/src/utils/shopCategories';

const nowIso = () => new Date().toISOString();

const scenarioCategories: ShopCategory[] = [
  'Restaurant',
  'Café',
  'Bar',
  'Pizzeria',
  'Bäckerei',
  'Konditorei',
  'Eisdiele',
  'Fast Food',
  'Coiffeur',
  'Nagelstudio',
  'Kosmetikstudio',
  'Massage',
  'Fitnessstudio',
  'Optiker',
  'Kleiderladen',
  'Schuhladen',
  'Elektronikladen',
  'Buchhandlung',
  'Blumenladen',
  'Supermarkt',
];

const baseCoordinates = [
  { latitude: 47.1368, longitude: 7.2468 },
  { latitude: 47.1385, longitude: 7.2504 },
  { latitude: 47.1338, longitude: 7.2448 },
  { latitude: 47.1402, longitude: 7.2555 },
  { latitude: 47.1326, longitude: 7.2394 },
];

const contentByTopCategory = {
  'food-drink': {
    products: [
      { name: 'Hausspecial', description: 'Beliebter Favorit im Haus', price: 'CHF 16' },
      { name: 'Saison Angebot', description: 'Nur fuer kurze Zeit', price: 'CHF 9' },
    ],
    services: [{ name: 'Take Away', description: 'Schnell mitnehmen' }],
    deal: { title: 'Heute 2 fuer 1', description: 'Nur heute auf ein ausgewaehltes Highlight aus dem Sortiment.' },
  },
  'mode-beauty': {
    products: [{ name: 'Pflegeprodukt', description: 'Empfohlen vom Team', price: 'CHF 24' }],
    services: [
      { name: 'Express Termin', description: 'Schneller Termin vor Ort', priceFrom: 'ab CHF 35' },
      { name: 'Beratung', description: 'Persoenliche Stilberatung', priceFrom: 'ab CHF 20' },
    ],
    deal: { title: '15% Beauty Deal', description: 'Gueltig auf ausgewaehlte Leistungen oder Artikel.' },
  },
  shopping: {
    products: [
      { name: 'Neuheit im Shop', description: 'Frisch eingetroffen', price: 'CHF 39' },
      { name: 'Lieblingsprodukt', description: 'Bestseller im Sortiment', price: 'CHF 19' },
    ],
    services: [{ name: 'Beratung vor Ort', description: 'Persoenliche Hilfe im Laden' }],
    deal: { title: '10% auf Highlights', description: 'Rabatt auf ausgewaehlte Produkte im Shop.' },
  },
  'health-wellness': {
    products: [{ name: 'Wellness Produkt', description: 'Passend fuer Zuhause', price: 'CHF 22' }],
    services: [
      { name: 'Erstberatung', description: 'Persoenlicher Einstieg', priceFrom: 'ab CHF 30' },
      { name: 'Probetraining', description: 'Lerne uns kennen', priceFrom: 'Gratis' },
    ],
    deal: { title: 'Kennenlern Angebot', description: 'Einfacher Einstieg fuer neue Kundinnen und Kunden.' },
  },
  'home-service': {
    products: [{ name: 'Alltagsfavorit', description: 'Haeufig gekauft', price: 'CHF 18' }],
    services: [
      { name: 'Service vor Ort', description: 'Direkte Unterstuetzung im Laden' },
      { name: 'Schnellhilfe', description: 'Kurz und unkompliziert' },
    ],
    deal: { title: 'Service Spezial', description: 'Mehrwert fuer spontane Besuche in Biel.' },
  },
  'events-culture': {
    products: [{ name: 'Ticket Special', description: 'Besondere Option fuer Besucher', price: 'CHF 25' }],
    services: [{ name: 'Abendprogramm', description: 'Highlight in Biel heute Abend' }],
    deal: { title: 'Event Special', description: 'Vorteil fuer einen begrenzten Zeitraum.' },
  },
} as const;

const buildShopName = (category: ShopCategory, index: number) => {
  const base = category
    .replace('ä', 'ae')
    .replace('ö', 'oe')
    .replace('ü', 'ue')
    .replace('é', 'e');

  return `${base} Biel ${index + 1}`;
};

const buildScenarioShops = (): ShopProfile[] => {
  const now = nowIso();

  return scenarioCategories.map((category, index) => {
    const topCategory = categoryToTopCategory[category];
    const content = contentByTopCategory[topCategory];
    const anchor = baseCoordinates[index % baseCoordinates.length];
    const latitudeOffset = (Math.floor(index / baseCoordinates.length) * 0.0015) + ((index % 2) * 0.0004);
    const longitudeOffset = (Math.floor(index / baseCoordinates.length) * 0.0012) + (((index + 1) % 2) * 0.0005);

    return {
      id: `temp-shop-${index + 1}`,
      ownerUserId: `temp-owner-${index + 1}`,
      name: buildShopName(category, index),
      category,
      description: `Temporärer Demo-Shop fuer ${category} in Biel mit schoener Nutzeransicht und aktiver Aktion.`,
      slogan: 'Nur fuer diesen Testlauf',
      street: 'Teststrasse',
      houseNumber: String(index + 1),
      zip: '2502',
      city: 'Biel/Bienne',
      country: 'Schweiz',
      latitude: anchor.latitude + latitudeOffset,
      longitude: anchor.longitude + longitudeOffset,
      phone: `+41 32 400 0${String(index).padStart(2, '0')}`,
      email: `temp-shop-${index + 1}@biel.local`,
      website: 'https://biel.local/demo',
      openingHours: mockShops[0].openingHours,
      products: content.products.map((product, itemIndex) => ({
        id: `temp-product-${index}-${itemIndex}`,
        name: product.name,
        description: product.description,
        price: product.price,
      })),
      services: content.services.map((service, itemIndex) => ({
        id: `temp-service-${index}-${itemIndex}`,
        name: service.name,
        description: service.description,
        priceFrom: 'priceFrom' in service ? service.priceFrom : undefined,
      })),
      logoUrl: mockShops[index % mockShops.length]?.logoUrl ?? mockShops[0].logoUrl,
      heroImageUrl: mockShops[index % mockShops.length]?.heroImageUrl ?? mockShops[0].heroImageUrl,
      galleryImageUrls: mockShops[index % mockShops.length]?.galleryImageUrls ?? mockShops[0].galleryImageUrls,
      mapIcon: categoryToMapIcon[category] ?? getDefaultMapIconForCategory(category),
      subscriptionStatus: 'active',
      adminApproved: true,
      isVisibleOnMap: true,
      createdAt: now,
      updatedAt: now,
    };
  });
};

const buildScenarioOffers = (shops: ShopProfile[]): Offer[] => {
  const now = nowIso();

  return shops.map((shop, index) => {
    const content = contentByTopCategory[categoryToTopCategory[shop.category]];

    return {
      id: `temp-offer-${index + 1}`,
      shopId: shop.id,
      title: content.deal.title,
      description: content.deal.description,
      type: index % 3 === 0 ? 'percent' : index % 3 === 1 ? 'bundle' : 'fixed_price',
      discountPercent: index % 3 === 0 ? 15 : undefined,
      fixedPriceLabel: index % 3 === 2 ? 'CHF 19' : undefined,
      bundleDetails: index % 3 === 1 ? 'Special Bundle' : undefined,
      rewardLabel: index % 3 === 1 ? 'Special Bundle Angebot' : undefined,
      pointsReward: 30 + (index % 4) * 10,
      validUntil: '2026-12-31',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      promotion:
        index % 5 === 0
          ? {
              type: 'featured_placement',
              priceLabel: 'CHF 29',
              purchasedAt: now,
              notificationBlast: false,
              featuredPlacement: true,
            }
          : undefined,
    };
  });
};

export const applySimulatedMarketScenario = () => {
  const appState = useAppStore.getState();
  const authState = useAuthStore.getState();
  const shopState = useShopStore.getState();

  if (!appState.tempScenario) {
    appState.setTempScenario({
      kind: 'simulated-market',
      restoreShops: shopState.shops,
    });
  }

  const simulatedShops = buildScenarioShops();
  const simulatedOffers = buildScenarioOffers(simulatedShops);

  shopState.setShops(simulatedShops);
  offerService.replaceAll(simulatedOffers);

  authState.logout();

  const newUser = authState.createUserProfile({
    name: 'Demo Nutzer Neu',
    birthDate: '1996-05-17',
    email: `demo-neu-${Date.now()}@biel.local`,
    phone: '+41 79 555 55 55',
  });

  return newUser;
};

export const cleanupSimulatedMarketScenario = () => {
  const appState = useAppStore.getState();
  const scenario = appState.tempScenario;
  const hasRuntimeScenarioOffers = offerService.getAll().some((offer) => offer.id.startsWith('temp-offer-'));

  if (!scenario || scenario.kind !== 'simulated-market' || hasRuntimeScenarioOffers) {
    return false;
  }

  useShopStore.getState().setShops(scenario.restoreShops);
  useAuthStore.getState().logout();
  appState.setPendingTestLogin(null);
  appState.setTempScenario(null);
  offerService.reset();

  return true;
};
