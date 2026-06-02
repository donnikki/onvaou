import { OfferType, ShopCategory } from '@/src/types';

import { ShopTopCategoryId } from '@/src/utils/shopCategories';

export type AdminOfferSuggestionSeed = {
  key: string;
  label: string;
  description: string;
  type: OfferType;
  title: string;
  draft: {
    name: string;
    description: string;
    discountPercent?: string;
    freeItem?: string;
    purchaseRequirement?: string;
    fixedPriceLabel?: string;
    bundleDetails?: string;
    maxRedemptions?: string;
    inventoryTotal?: string;
    rewardLabel?: string;
    friendsRequired?: string;
    pointsReward?: string;
    validUntil?: string;
  };
  topCategories?: ShopTopCategoryId[];
  categories?: ShopCategory[];
};

type OfferSuggestionMatch = {
  suggestion: AdminOfferSuggestionSeed;
  matchScore: number;
};

const defaultValidUntil = '2026-12-31';

export const adminOfferSuggestions: AdminOfferSuggestionSeed[] = [
  {
    key: 'universal-10-percent',
    label: '10% Rabatt',
    description: 'Einfacher Standard-Deal fuer fast jeden Shop.',
    type: 'percent',
    title: '10% auf ausgewaehlte Angebote',
    draft: {
      name: 'Standard Rabatt 10%',
      description: 'Gueltig auf ausgewaehlte Produkte oder Dienstleistungen.',
      discountPercent: '10',
      pointsReward: '20',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'universal-15-percent',
    label: '15% Aktionsrabatt',
    description: 'Klare Aktion fuer Wochenstart oder ruhige Tage.',
    type: 'percent',
    title: '15% Aktionsrabatt',
    draft: {
      name: 'Aktionsrabatt 15%',
      description: 'Befristete Aktion fuer ausgewaehlte Produkte oder Services.',
      discountPercent: '15',
      pointsReward: '30',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'universal-points-boost',
    label: 'Punkte Boost',
    description: 'Ideal, wenn kein Preisrabatt noetig ist.',
    type: 'points_boost',
    title: 'Doppelte Punkte',
    draft: {
      name: 'Doppelte Punkte',
      description: 'Bei dieser Aktion sammeln Nutzer besonders viele Punkte.',
      rewardLabel: 'Doppelte Punkte',
      pointsReward: '100',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'universal-limited',
    label: 'Nur fuer die ersten 20',
    description: 'Schafft Tempo und ist leicht verstaendlich.',
    type: 'limited_reward',
    title: 'Nur fuer die ersten 20 Nutzer',
    draft: {
      name: 'Erste 20',
      description: 'Solange Vorrat reicht. Restbestand wird live angezeigt.',
      inventoryTotal: '20',
      rewardLabel: 'Exklusiver Vorteil',
      pointsReward: '60',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'universal-fixed-price',
    label: 'Spezialpreis',
    description: 'Ein klarer fixer Preis statt Rabatt-Prozent.',
    type: 'fixed_price',
    title: 'Spezialpreis fuer kurze Zeit',
    draft: {
      name: 'Spezialpreis',
      description: 'Ein beliebtes Angebot zu einem klar kommunizierten Aktionspreis.',
      fixedPriceLabel: 'CHF 19',
      pointsReward: '25',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'food-lunch',
    label: 'Lunch Deal',
    description: 'Mittagsaktion fuer Restaurants und Cafes.',
    type: 'fixed_price',
    title: 'Lunch Deal',
    topCategories: ['food-drink'],
    draft: {
      name: 'Lunch Deal',
      description: 'Mittagsangebot von 11:30 bis 14:00 Uhr.',
      fixedPriceLabel: 'CHF 18',
      rewardLabel: 'Lunch inkl. Getraenk',
      pointsReward: '35',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'food-coffee-combo',
    label: 'Kaffee + Gipfeli',
    description: 'Beliebte Morgenaktion fuer Cafes und Baeckereien.',
    type: 'bundle',
    title: 'Kaffee + Gipfeli Kombi',
    categories: ['Café', 'Bäckerei'],
    draft: {
      name: 'Morgen Kombi',
      description: 'Perfekte Morgenaktion fuer Pendler und Fruehaufsteher.',
      bundleDetails: 'Kaffee + Gipfeli',
      fixedPriceLabel: 'CHF 7.90',
      pointsReward: '25',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'food-dessert-free',
    label: 'Gratis Dessert',
    description: 'Klassische Restaurant-Aktion mit Mehrwert.',
    type: 'free_with_purchase',
    title: 'Gratis Dessert zum Hauptgericht',
    categories: ['Restaurant', 'Pizzeria'],
    draft: {
      name: 'Dessert gratis',
      description: 'Beim Kauf eines Hauptgerichts gibt es ein Dessert dazu.',
      freeItem: 'Dessert',
      purchaseRequirement: 'Bei Kauf eines Hauptgerichts',
      pointsReward: '45',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'food-happy-hour',
    label: 'Afterwork Happy Hour',
    description: 'Funktioniert fuer Bars und Cafes sehr gut.',
    type: 'happy_hour',
    title: 'Afterwork Happy Hour',
    categories: ['Bar', 'Café'],
    draft: {
      name: 'Afterwork Happy Hour',
      description: 'Gueltig werktags von 17:00 bis 19:00 Uhr.',
      fixedPriceLabel: 'CHF 14',
      rewardLabel: '2 Drinks zum Spezialpreis',
      pointsReward: '30',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'food-family-pizza',
    label: 'Pizza Family Deal',
    description: 'Familienfreundliche Aktion fuer Pizzerien.',
    type: 'bundle',
    title: 'Family Pizza Deal',
    categories: ['Pizzeria'],
    draft: {
      name: 'Family Pizza',
      description: '2 Pizzen und 2 Softdrinks als Paketangebot.',
      bundleDetails: '2 Pizzen + 2 Softdrinks',
      fixedPriceLabel: 'CHF 29',
      pointsReward: '50',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'food-bakery-evening',
    label: 'Feierabend Angebot',
    description: 'Hilft, Restwaren attraktiv zu verkaufen.',
    type: 'percent',
    title: '30% auf Frischwaren ab 17 Uhr',
    categories: ['Bäckerei', 'Konditorei'],
    draft: {
      name: 'Feierabend Rabatt',
      description: 'Gueltig auf ausgewaehlte Frischwaren kurz vor Ladenschluss.',
      discountPercent: '30',
      pointsReward: '20',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'food-gelato',
    label: '2. Kugel halbpreis',
    description: 'Einfach und stark fuer Eisdielen.',
    type: 'special',
    title: '2. Kugel zum halben Preis',
    categories: ['Eisdiele'],
    draft: {
      name: 'Gelato Deal',
      description: 'Beim Kauf einer Kugel gibt es die zweite zum halben Preis.',
      rewardLabel: '2. Kugel 50% guenstiger',
      pointsReward: '20',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'beauty-styling-combo',
    label: 'Styling Kombi',
    description: 'Beliebt fuer Coiffeur und Kosmetik.',
    type: 'bundle',
    title: 'Schnitt + Styling Kombi',
    topCategories: ['mode-beauty'],
    draft: {
      name: 'Styling Kombi',
      description: 'Zwei passende Leistungen als attraktives Paket.',
      bundleDetails: 'Schnitt + Styling',
      fixedPriceLabel: 'CHF 59',
      pointsReward: '40',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'beauty-add-on',
    label: 'Gratis Add-on',
    description: 'Kleiner Bonus mit hoher Wirkung.',
    type: 'free_with_purchase',
    title: 'Gratis Pflege-Add-on',
    categories: ['Coiffeur', 'Kosmetikstudio', 'Nagelstudio'],
    draft: {
      name: 'Gratis Add-on',
      description: 'Zu einer gebuchten Hauptleistung gibt es ein kleines Pflege-Add-on.',
      freeItem: 'Pflege-Add-on',
      purchaseRequirement: 'Bei Buchung einer Hauptleistung',
      pointsReward: '35',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'beauty-weekday',
    label: 'Wochenmitte Rabatt',
    description: 'Fuellt ruhigere Termine unter der Woche.',
    type: 'percent',
    title: '15% unter der Woche',
    categories: ['Coiffeur', 'Nagelstudio', 'Kosmetikstudio', 'Kosmetik'],
    draft: {
      name: 'Wochenmitte Rabatt',
      description: 'Gueltig Dienstag bis Donnerstag auf ausgewaehlte Leistungen.',
      discountPercent: '15',
      pointsReward: '25',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'beauty-fashion-week',
    label: 'Outfit Woche',
    description: 'Sinnvoll fuer Mode- und Schuhlaeden.',
    type: 'percent',
    title: '20% auf die zweite Position',
    categories: ['Kleiderladen', 'Schuhladen'],
    draft: {
      name: 'Outfit Woche',
      description: 'Beim Kauf eines Artikels gibt es auf den zweiten 20% Rabatt.',
      discountPercent: '20',
      rewardLabel: '20% auf die zweite Position',
      pointsReward: '30',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'beauty-jewelry-care',
    label: 'Schmuck Pflegebonus',
    description: 'Passend fuer Schmuckgeschaefte.',
    type: 'special',
    title: 'Gratis Schmuckreinigung',
    categories: ['Schmuckladen'],
    draft: {
      name: 'Schmuck Pflegebonus',
      description: 'Beim Einkauf gibt es eine kostenlose Schmuckreinigung dazu.',
      rewardLabel: 'Gratis Schmuckreinigung',
      pointsReward: '25',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'shopping-two-for-one',
    label: '2 fuer 1 Aktion',
    description: 'Ein vertrautes Format fuer kleinere Waren.',
    type: 'two_for_one',
    title: '2 fuer 1 auf Aktionsartikel',
    topCategories: ['shopping'],
    draft: {
      name: '2 fuer 1',
      description: 'Zwei gleiche Aktionsartikel zum Preis von einem.',
      purchaseRequirement: 'Gilt auf gleiches Produkt',
      pointsReward: '45',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'shopping-bundle-school',
    label: 'Starter Bundle',
    description: 'Ideal fuer Papeterie und Buchhandlung.',
    type: 'bundle',
    title: 'Starter Bundle',
    categories: ['Papeterie', 'Buchhandlung'],
    draft: {
      name: 'Starter Bundle',
      description: 'Beliebte Basisprodukte als praktisches Aktionspaket.',
      bundleDetails: 'Notizbuch + Stift + Marker',
      fixedPriceLabel: 'CHF 14',
      pointsReward: '25',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'shopping-flower-gift',
    label: 'Blumen Bonus',
    description: 'Kleine Aufmerksamkeit mit Kauf.',
    type: 'free_with_purchase',
    title: 'Gratis Mini Strauss',
    categories: ['Blumenladen'],
    draft: {
      name: 'Mini Strauss',
      description: 'Zu einem grossen Strauss gibt es einen kleinen Bonus dazu.',
      freeItem: 'Mini Strauss',
      purchaseRequirement: 'Ab CHF 30 Einkauf',
      pointsReward: '30',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'shopping-tech-price',
    label: 'Elektronik Spezialpreis',
    description: 'Klar kommunizierter Aktionspreis fuer ein Highlight-Produkt.',
    type: 'fixed_price',
    title: 'Wochenend Spezialpreis',
    categories: ['Elektronikladen'],
    draft: {
      name: 'Wochenendpreis',
      description: 'Ein ausgewaehltes Technikprodukt fuer kurze Zeit zum Spezialpreis.',
      fixedPriceLabel: 'CHF 99',
      pointsReward: '35',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'shopping-market-basket',
    label: 'Marktkorb Deal',
    description: 'Sehr passend fuer Markt und Supermarkt.',
    type: 'bundle',
    title: 'Marktkorb Spezial',
    categories: ['Markt', 'Supermarkt', 'Getränkeladen'],
    draft: {
      name: 'Marktkorb Spezial',
      description: 'Mehrere Bestseller als fertiges Paket fuer spontane Einkaeufe.',
      bundleDetails: '3 saisonale Produkte im Paket',
      fixedPriceLabel: 'CHF 18',
      pointsReward: '25',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'health-intro',
    label: 'Kennenlern Angebot',
    description: 'Perfekt fuer neue Kunden und Erstbesuche.',
    type: 'fixed_price',
    title: 'Kennenlern Angebot',
    topCategories: ['health-wellness'],
    draft: {
      name: 'Kennenlern Angebot',
      description: 'Einfaches Einstiegsangebot fuer Erstkunden.',
      fixedPriceLabel: 'CHF 29',
      pointsReward: '30',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'health-duo',
    label: 'Duo Vorteil',
    description: 'Gut fuer gemeinsame Besuche oder Empfehlungen.',
    type: 'group_visit',
    title: 'Gemeinsam vorbeikommen und profitieren',
    categories: ['Massage', 'Fitnessstudio'],
    draft: {
      name: 'Duo Vorteil',
      description: 'Gueltig, wenn der Nutzer mit einer Begleitperson erscheint.',
      friendsRequired: '1',
      rewardLabel: 'Gemeinsamer Vorteil',
      pointsReward: '50',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'health-pharmacy-pack',
    label: 'Saison Paket',
    description: 'Sinnvoll fuer Apotheken und Optiker.',
    type: 'bundle',
    title: 'Saison Paket',
    categories: ['Apotheke', 'Optiker'],
    draft: {
      name: 'Saison Paket',
      description: 'Passende Saisonprodukte als uebersichtliches Paket.',
      bundleDetails: '2 passende Saisonprodukte',
      fixedPriceLabel: 'CHF 24',
      pointsReward: '20',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'health-fitness-week',
    label: 'Probetraining',
    description: 'Starker Einstieg fuer Studios und Therapiepraxen.',
    type: 'free_item',
    title: 'Gratis Probetraining',
    categories: ['Fitnessstudio', 'Physiotherapie'],
    draft: {
      name: 'Probetraining',
      description: 'Neue Nutzer koennen eine Einheit kostenlos testen.',
      freeItem: '1 Probetraining',
      rewardLabel: '1 Probetraining gratis',
      pointsReward: '35',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'home-pet-bonus',
    label: 'Tierbedarf Bonus',
    description: 'Passend fuer regelmaessige Einkaeufe.',
    type: 'percent',
    title: '15% auf den zweiten Sack Futter',
    categories: ['Tierbedarf'],
    draft: {
      name: 'Futter Bonus',
      description: 'Beim Kauf eines Futtersacks gibt es auf den zweiten einen Vorteil.',
      discountPercent: '15',
      rewardLabel: '15% auf den zweiten Sack',
      pointsReward: '25',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'home-carwash',
    label: 'Auto Spa Paket',
    description: 'Klares Paket fuer Autowasch-Angebote.',
    type: 'bundle',
    title: 'Auto Spa Paket',
    categories: ['Autowaschanlage'],
    draft: {
      name: 'Auto Spa',
      description: 'Komplettpaket fuer Innen- und Aussenreinigung.',
      bundleDetails: 'Aussenwaesche + Innenreinigung',
      fixedPriceLabel: 'CHF 29',
      pointsReward: '35',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'home-garden',
    label: 'Home Starter',
    description: 'Gut fuer Heim, Garten und Wohnen.',
    type: 'bundle',
    title: 'Home Starter Bundle',
    categories: ['Heim/Garten', 'Brocki'],
    draft: {
      name: 'Home Starter',
      description: 'Passende Produkte fuer Zuhause als kleines Bundle.',
      bundleDetails: '2-3 kombinierte Produkte',
      fixedPriceLabel: 'CHF 22',
      pointsReward: '20',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'events-early-bird',
    label: 'Early Bird',
    description: 'Sehr passend fuer Events und Kultur.',
    type: 'percent',
    title: 'Early Bird Vorteil',
    topCategories: ['events-culture'],
    draft: {
      name: 'Early Bird',
      description: 'Frueh buchen oder frueh kommen und direkt profitieren.',
      discountPercent: '20',
      pointsReward: '40',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'events-group',
    label: 'Gruppen Angebot',
    description: 'Hilft, mehrere Leute gemeinsam zu aktivieren.',
    type: 'group_visit',
    title: 'Mit Freunden profitieren',
    categories: ['Konzert', 'Festival', 'Party', 'Theater', 'Kino', 'Sportevent'],
    draft: {
      name: 'Gruppen Angebot',
      description: 'Gueltig, wenn Nutzer zusammen mit Freunden erscheinen.',
      friendsRequired: '2',
      rewardLabel: 'Gruppenvorteil vor Ort',
      pointsReward: '60',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'events-welcome-drink',
    label: 'Welcome Drink',
    description: 'Einfaches Upgrade fuer Partys und Events.',
    type: 'free_with_purchase',
    title: 'Welcome Drink inklusive',
    categories: ['Party', 'Festival', 'Konzert', 'Bar'],
    draft: {
      name: 'Welcome Drink',
      description: 'Zu einem Ticket oder Eintritt gibt es einen Welcome Drink dazu.',
      freeItem: 'Welcome Drink',
      purchaseRequirement: 'Mit gueltigem Eintritt',
      pointsReward: '35',
      validUntil: defaultValidUntil,
    },
  },
  {
    key: 'events-market-hour',
    label: 'Markt Happy Hour',
    description: 'Lebendige Zeitfenster-Aktion fuer Marktstaende.',
    type: 'happy_hour',
    title: 'Markt Happy Hour',
    categories: ['Markt', 'Ausstellung'],
    draft: {
      name: 'Markt Happy Hour',
      description: 'Gueltig waehrend eines kommunizierten Zeitfensters vor Ort.',
      rewardLabel: 'Spezialangebot vor Ort',
      fixedPriceLabel: 'CHF 10',
      pointsReward: '20',
      validUntil: defaultValidUntil,
    },
  },
];

export const getAdminOfferSuggestions = (params?: {
  topCategoryId?: ShopTopCategoryId | null;
  shopCategory?: ShopCategory | null;
}) => {
  const topCategoryId = params?.topCategoryId ?? null;
  const shopCategory = params?.shopCategory ?? null;

  const matches: OfferSuggestionMatch[] = adminOfferSuggestions
    .map((suggestion) => {
      const exactCategoryMatch = suggestion.categories?.includes(shopCategory as ShopCategory) ?? false;
      const topCategoryMatch = suggestion.topCategories?.includes(topCategoryId as ShopTopCategoryId) ?? false;
      const isUniversal = !suggestion.categories?.length && !suggestion.topCategories?.length;

      if (suggestion.categories?.length && !exactCategoryMatch) {
        return null;
      }

      if (!suggestion.categories?.length && suggestion.topCategories?.length && !topCategoryMatch) {
        return null;
      }

      return {
        suggestion,
        matchScore: exactCategoryMatch ? 3 : topCategoryMatch ? 2 : isUniversal ? 1 : 0,
      };
    })
    .filter((entry): entry is OfferSuggestionMatch => entry !== null);

  return matches
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return left.suggestion.label.localeCompare(right.suggestion.label, 'de-CH');
    })
    .map((entry) => entry.suggestion);
};
