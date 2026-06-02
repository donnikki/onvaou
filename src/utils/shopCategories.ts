import { ImageSourcePropType } from 'react-native';

import { MapIcon, ShopCategory, ShopProfile, mapIconIds, shopCategoryLabels } from '@/src/types';

type CategoryOption = {
  category: ShopCategory;
  icon: MapIcon;
};

export type ShopTopCategoryId =
  | 'mode-beauty'
  | 'shopping'
  | 'food-drink'
  | 'health-wellness'
  | 'home-service'
  | 'events-culture';

export type ShopTopCategory = {
  id: ShopTopCategoryId;
  label: string;
  icon: MapIcon;
  categories: ShopCategory[];
};

export const shopCategoryOptions: CategoryOption[] = [
  { category: 'Kleiderladen', icon: 'kleiderladen' },
  { category: 'Schuhladen', icon: 'schuhladen' },
  { category: 'Schmuckladen', icon: 'schmuckladen' },
  { category: 'Elektronikladen', icon: 'elektronikladen' },
  { category: 'Buchhandlung', icon: 'buchhandlung' },
  { category: 'Blumenladen', icon: 'blumenladen' },
  { category: 'Supermarkt', icon: 'supermarkt' },
  { category: 'Apotheke', icon: 'apotheke' },
  { category: 'Heim/Garten', icon: 'heim-garten' },
  { category: 'Tierbedarf', icon: 'tierbedarf' },
  { category: 'Papeterie', icon: 'papeterie' },
  { category: 'Brocki', icon: 'brocki' },
  { category: 'Kosmetik', icon: 'kosmetik' },
  { category: 'Getränkeladen', icon: 'getraenkeladen' },
  { category: 'Restaurant', icon: 'restaurant' },
  { category: 'Café', icon: 'cafe' },
  { category: 'Bar', icon: 'bar' },
  { category: 'Pizzeria', icon: 'pizzeria' },
  { category: 'Bäckerei', icon: 'baeckerei' },
  { category: 'Konditorei', icon: 'konditorei' },
  { category: 'Eisdiele', icon: 'eisdiele' },
  { category: 'Fast Food', icon: 'fast-food' },
  { category: 'Coiffeur', icon: 'coiffeur' },
  { category: 'Nagelstudio', icon: 'nagelstudio' },
  { category: 'Kosmetikstudio', icon: 'kosmetikstudio' },
  { category: 'Massage', icon: 'massage' },
  { category: 'Physiotherapie', icon: 'physiotherapie' },
  { category: 'Fitnessstudio', icon: 'fitnessstudio' },
  { category: 'Optiker', icon: 'optiker' },
  { category: 'Autowaschanlage', icon: 'autowaschanlage' },
  { category: 'Konzert', icon: 'konzert' },
  { category: 'Festival', icon: 'festival' },
  { category: 'Party', icon: 'party' },
  { category: 'Markt', icon: 'markt' },
  { category: 'Ausstellung', icon: 'ausstellung' },
  { category: 'Kino', icon: 'kino' },
  { category: 'Theater', icon: 'theater' },
  { category: 'Sportevent', icon: 'sportevent' },
];

export const shopTopCategories: ShopTopCategory[] = [
  {
    id: 'mode-beauty',
    label: 'Mode & Beauty',
    icon: 'kleiderladen',
    categories: ['Kleiderladen', 'Schuhladen', 'Schmuckladen', 'Coiffeur', 'Nagelstudio', 'Kosmetik', 'Kosmetikstudio'],
  },
  {
    id: 'shopping',
    label: 'Einkaufen',
    icon: 'supermarkt',
    categories: ['Elektronikladen', 'Buchhandlung', 'Blumenladen', 'Supermarkt', 'Papeterie', 'Brocki', 'Getränkeladen', 'Markt'],
  },
  {
    id: 'food-drink',
    label: 'Essen & Trinken',
    icon: 'restaurant',
    categories: ['Restaurant', 'Café', 'Bar', 'Pizzeria', 'Bäckerei', 'Konditorei', 'Eisdiele', 'Fast Food'],
  },
  {
    id: 'health-wellness',
    label: 'Gesundheit & Wellness',
    icon: 'apotheke',
    categories: ['Apotheke', 'Massage', 'Physiotherapie', 'Fitnessstudio', 'Optiker'],
  },
  {
    id: 'home-service',
    label: 'Haushalt & Service',
    icon: 'heim-garten',
    categories: ['Heim/Garten', 'Tierbedarf', 'Autowaschanlage'],
  },
  {
    id: 'events-culture',
    label: 'Events & Kultur',
    icon: 'festival',
    categories: ['Konzert', 'Festival', 'Party', 'Ausstellung', 'Kino', 'Theater', 'Sportevent'],
  },
];

export const categoryList: ShopCategory[] = [...shopCategoryLabels];

export const categoryToMapIcon = shopCategoryOptions.reduce(
  (accumulator, option) => ({
    ...accumulator,
    [option.category]: option.icon,
  }),
  {} as Record<ShopCategory, MapIcon>,
);

export const topCategoryToLeafCategories = shopTopCategories.reduce(
  (accumulator, topCategory) => ({
    ...accumulator,
    [topCategory.id]: topCategory.categories,
  }),
  {} as Record<ShopTopCategoryId, ShopCategory[]>,
);

export const categoryToTopCategory = shopTopCategories.reduce(
  (accumulator, topCategory) => {
    topCategory.categories.forEach((category) => {
      accumulator[category] = topCategory.id;
    });

    return accumulator;
  },
  {} as Record<ShopCategory, ShopTopCategoryId>,
);

export const mapIconAssets: Record<MapIcon, ImageSourcePropType> = {
  kleiderladen: require('../../assets/map-icons/kleiderladen.png'),
  schuhladen: require('../../assets/map-icons/schuhladen.png'),
  schmuckladen: require('../../assets/map-icons/schmuckladen.png'),
  elektronikladen: require('../../assets/map-icons/elektronikladen.png'),
  buchhandlung: require('../../assets/map-icons/buchhandlung.png'),
  blumenladen: require('../../assets/map-icons/blumenladen.png'),
  supermarkt: require('../../assets/map-icons/supermarkt.png'),
  apotheke: require('../../assets/map-icons/apotheke.png'),
  'heim-garten': require('../../assets/map-icons/heim-garten.png'),
  tierbedarf: require('../../assets/map-icons/tierbedarf.png'),
  papeterie: require('../../assets/map-icons/papeterie.png'),
  brocki: require('../../assets/map-icons/brocki.png'),
  kosmetik: require('../../assets/map-icons/kosmetik.png'),
  getraenkeladen: require('../../assets/map-icons/getraenkeladen.png'),
  restaurant: require('../../assets/map-icons/restaurant.png'),
  cafe: require('../../assets/map-icons/cafe.png'),
  bar: require('../../assets/map-icons/bar.png'),
  pizzeria: require('../../assets/map-icons/pizzeria.png'),
  baeckerei: require('../../assets/map-icons/baeckerei.png'),
  konditorei: require('../../assets/map-icons/konditorei.png'),
  eisdiele: require('../../assets/map-icons/eisdiele.png'),
  'fast-food': require('../../assets/map-icons/fast-food.png'),
  coiffeur: require('../../assets/map-icons/coiffeur.png'),
  nagelstudio: require('../../assets/map-icons/nagelstudio.png'),
  kosmetikstudio: require('../../assets/map-icons/kosmetikstudio.png'),
  massage: require('../../assets/map-icons/massage.png'),
  physiotherapie: require('../../assets/map-icons/physiotherapie.png'),
  fitnessstudio: require('../../assets/map-icons/fitnessstudio.png'),
  optiker: require('../../assets/map-icons/optiker.png'),
  autowaschanlage: require('../../assets/map-icons/autowaschanlage.png'),
  konzert: require('../../assets/map-icons/konzert.png'),
  festival: require('../../assets/map-icons/festival.png'),
  party: require('../../assets/map-icons/party.png'),
  markt: require('../../assets/map-icons/markt.png'),
  ausstellung: require('../../assets/map-icons/ausstellung.png'),
  kino: require('../../assets/map-icons/kino.png'),
  theater: require('../../assets/map-icons/theater.png'),
  sportevent: require('../../assets/map-icons/sportevent.png'),
};

const shopCategorySet = new Set<string>(shopCategoryLabels);
const mapIconSet = new Set<string>(mapIconIds);

const legacyCategoryMap: Record<string, ShopCategory> = {
  'Café': 'Café',
  Restaurant: 'Restaurant',
  Bar: 'Bar',
  Club: 'Party',
  Coiffeur: 'Coiffeur',
  Supermarkt: 'Supermarkt',
  Event: 'Festival',
  Dienstleistung: 'Markt',
  Sonstiges: 'Markt',
};

const legacyMapIconMap: Record<string, MapIcon> = {
  scissors: 'coiffeur',
  'shopping-cart': 'supermarkt',
  beer: 'bar',
  coffee: 'cafe',
  utensils: 'restaurant',
  music: 'party',
  ticket: 'festival',
  wrench: 'markt',
  'map-pin': 'markt',
};

export const allLeafCategories = [...shopCategoryLabels];
export const defaultSelectedCategories = [...allLeafCategories];

export const getCategoryOption = (category: ShopCategory) =>
  shopCategoryOptions.find((option) => option.category === category) ?? shopCategoryOptions[0];

export const getTopCategory = (topCategoryId: ShopTopCategoryId) =>
  shopTopCategories.find((entry) => entry.id === topCategoryId) ?? shopTopCategories[0];

export const getDefaultMapIconForCategory = (category: ShopCategory) => categoryToMapIcon[category];

export const getMapIconSource = (icon: MapIcon) => mapIconAssets[icon];

export const normalizeShopCategory = (value: string | null | undefined): ShopCategory => {
  if (value && shopCategorySet.has(value)) {
    return value as ShopCategory;
  }

  if (value && legacyCategoryMap[value]) {
    return legacyCategoryMap[value];
  }

  return 'Markt';
};

export const normalizeSelectedCategories = (value: string[] | null | undefined): ShopCategory[] => {
  if (!value) {
    return [...defaultSelectedCategories];
  }

  return Array.from(new Set(value.map((entry) => normalizeShopCategory(entry))));
};

export const getEffectiveSelectedCategories = (selectedCategories: ShopCategory[]) => selectedCategories;

export const areAllCategoriesSelected = (selectedCategories: ShopCategory[]) =>
  selectedCategories.length === allLeafCategories.length;

export const isTopCategoryFullySelected = (
  topCategoryId: ShopTopCategoryId,
  selectedCategories: ShopCategory[],
) => {
  const activeCategories = new Set(selectedCategories);
  return topCategoryToLeafCategories[topCategoryId].every((category) => activeCategories.has(category));
};

export const isTopCategoryPartiallySelected = (
  topCategoryId: ShopTopCategoryId,
  selectedCategories: ShopCategory[],
) => {
  const activeCategories = new Set(selectedCategories);
  const categories = topCategoryToLeafCategories[topCategoryId];
  const selectedCount = categories.filter((category) => activeCategories.has(category)).length;

  return selectedCount > 0 && selectedCount < categories.length;
};

export const toggleTopCategorySelection = (
  selectedCategories: ShopCategory[],
  topCategoryId: ShopTopCategoryId,
) => {
  const activeCategories = new Set(selectedCategories);
  const topCategories = topCategoryToLeafCategories[topCategoryId];
  const everySelected = topCategories.every((category) => activeCategories.has(category));

  topCategories.forEach((category) => {
    if (everySelected) {
      activeCategories.delete(category);
    } else {
      activeCategories.add(category);
    }
  });

  return normalizeSelectedCategories([...activeCategories]);
};

export const toggleLeafCategorySelection = (
  selectedCategories: ShopCategory[],
  category: ShopCategory,
) => {
  const activeCategories = new Set(selectedCategories);

  if (activeCategories.has(category)) {
    activeCategories.delete(category);
  } else {
    activeCategories.add(category);
  }

  return normalizeSelectedCategories([...activeCategories]);
};

export const normalizeMapIcon = (
  value: string | null | undefined,
  fallbackCategory?: ShopCategory | string | null,
): MapIcon => {
  if (value && mapIconSet.has(value)) {
    return value as MapIcon;
  }

  if (value && legacyMapIconMap[value]) {
    return legacyMapIconMap[value];
  }

  return getDefaultMapIconForCategory(normalizeShopCategory(fallbackCategory));
};

export const normalizeShopProfile = (shop: ShopProfile): ShopProfile => {
  const category = normalizeShopCategory(shop.category);

  return {
    ...shop,
    category,
    mapIcon: normalizeMapIcon(shop.mapIcon, category),
  };
};

export const normalizeShopProfiles = (shops: ShopProfile[]) => shops.map(normalizeShopProfile);
