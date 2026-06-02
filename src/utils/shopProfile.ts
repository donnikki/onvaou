import { OpeningHours, Product, ServiceItem, ShopCategory } from '@/src/types';

import { ShopTopCategoryId, categoryToTopCategory } from '@/src/utils/shopCategories';

export const openingDayOrder: (keyof OpeningHours)[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const openingDayLabels: Record<keyof OpeningHours, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
};

export type ShopContentConfig = {
  primaryTitle: string;
  primaryPlaceholder: string;
  secondaryTitle: string;
  secondaryPlaceholder: string;
  primaryKind: 'products' | 'services';
  secondaryKind: 'products' | 'services';
  primarySectionTitle: string;
  secondarySectionTitle: string;
  callToActionLabel: string;
};

const contentConfigs: Record<ShopTopCategoryId, ShopContentConfig> = {
  'food-drink': {
    primaryTitle: 'Menue / Karte',
    primaryPlaceholder: 'z. B.\nMittagsmenue | CHF 19\nPizza Margherita | CHF 16\nHausgemachter Eistee | CHF 5',
    secondaryTitle: 'Besonderheiten',
    secondaryPlaceholder: 'z. B.\nTake Away\nTerrasse am Abend\nVegetarische Optionen',
    primaryKind: 'products',
    secondaryKind: 'services',
    primarySectionTitle: 'Menue & Highlights',
    secondarySectionTitle: 'Besonderheiten',
    callToActionLabel: 'Vorbeischauen',
  },
  'shopping': {
    primaryTitle: 'Produkte im Fokus',
    primaryPlaceholder: 'z. B.\nKopfhörer | CHF 89\nNotizbuch Set | CHF 18\nSaisonstrauss | CHF 32',
    secondaryTitle: 'Extras im Shop',
    secondaryPlaceholder: 'z. B.\nGeschenkverpackung\nBeratung vor Ort\nBestellung auf Anfrage',
    primaryKind: 'products',
    secondaryKind: 'services',
    primarySectionTitle: 'Produkte',
    secondarySectionTitle: 'Extras im Shop',
    callToActionLabel: 'Shop besuchen',
  },
  'mode-beauty': {
    primaryTitle: 'Leistungen',
    primaryPlaceholder: 'z. B.\nHerrenhaarschnitt | ab CHF 42\nMake-up Beratung | ab CHF 35\nNageldesign | ab CHF 55',
    secondaryTitle: 'Produkte / Marken',
    secondaryPlaceholder: 'z. B.\nStyling Paste | CHF 19\nPflege Set | CHF 34\nKosmetik Linie Hausmarke',
    primaryKind: 'services',
    secondaryKind: 'products',
    primarySectionTitle: 'Leistungen',
    secondarySectionTitle: 'Produkte & Marken',
    callToActionLabel: 'Termin anfragen',
  },
  'health-wellness': {
    primaryTitle: 'Angebote / Leistungen',
    primaryPlaceholder: 'z. B.\nMassage 50 Min | ab CHF 95\nPhysio Ersttermin | ab CHF 120\nProbetraining | Gratis',
    secondaryTitle: 'Produkte / Zusatzinfos',
    secondaryPlaceholder: 'z. B.\nWiderstandsband | CHF 14\nVitamin Paket | CHF 24\nSehtest auf Anfrage',
    primaryKind: 'services',
    secondaryKind: 'products',
    primarySectionTitle: 'Leistungen',
    secondarySectionTitle: 'Produkte & Zusatzinfos',
    callToActionLabel: 'Anfragen',
  },
  'home-service': {
    primaryTitle: 'Angebote / Services',
    primaryPlaceholder: 'z. B.\nInnenreinigung | ab CHF 29\nLieferung in Biel\nBeratung fuer Zuhause',
    secondaryTitle: 'Produkte / Auswahl',
    secondaryPlaceholder: 'z. B.\nTierfutter Premium | CHF 39\nPflanzen Set | CHF 22\nHaushaltsartikel Aktion',
    primaryKind: 'services',
    secondaryKind: 'products',
    primarySectionTitle: 'Angebote & Services',
    secondarySectionTitle: 'Produkte & Auswahl',
    callToActionLabel: 'Mehr erfahren',
  },
  'events-culture': {
    primaryTitle: 'Programm / Highlights',
    primaryPlaceholder: 'z. B.\nLive DJ Freitag | ab 22:00\nOpen Air Set | CHF 25\nAbendvorstellung | 20:15',
    secondaryTitle: 'Tickets / Specials',
    secondaryPlaceholder: 'z. B.\nVIP Upgrade | CHF 18\nEarly Bird Ticket | CHF 22\nGetraenke Special',
    primaryKind: 'services',
    secondaryKind: 'products',
    primarySectionTitle: 'Programm & Highlights',
    secondarySectionTitle: 'Tickets & Specials',
    callToActionLabel: 'Entdecken',
  },
};

const parseLineParts = (line: string) => line.split('|').map((part) => part.trim()).filter(Boolean);

export const getShopContentConfig = (category: ShopCategory) => contentConfigs[categoryToTopCategory[category]];

export const serializeProducts = (products: Product[]) =>
  products
    .map((product) => [product.name, product.price, product.description && product.description !== `${product.name} im Sortiment` ? product.description : '']
      .filter(Boolean)
      .join(' | '))
    .join('\n');

export const serializeServices = (services: ServiceItem[]) =>
  services
    .map((service) =>
      [service.name, service.priceFrom, service.description && service.description !== `${service.name} im Shop` ? service.description : '']
        .filter(Boolean)
        .join(' | '),
    )
    .join('\n');

export const parseProductsFromLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, price, description] = parseLineParts(line);

      return {
        id: `product-${Date.now()}-${index}`,
        name,
        price,
        description: description ?? `${name} im Sortiment`,
      };
    });

export const parseServicesFromLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, priceFrom, description] = parseLineParts(line);

      return {
        id: `service-${Date.now()}-${index}`,
        name,
        priceFrom,
        description: description ?? `${name} im Shop`,
      };
    });

export const getTodayOpeningSummary = (openingHours: OpeningHours, date = new Date()) => {
  const jsDay = date.getDay();
  const index = jsDay === 0 ? 6 : jsDay - 1;
  const dayKey = openingDayOrder[index];
  const day = openingHours[dayKey];

  if (!day.isOpen) {
    return `Heute geschlossen`;
  }

  return `Heute ${day.openTime} - ${day.closeTime}`;
};
