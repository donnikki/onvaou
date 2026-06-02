import { SubscriptionStatus } from './subscription';

export const shopCategoryLabels = [
  'Kleiderladen',
  'Schuhladen',
  'Schmuckladen',
  'Elektronikladen',
  'Buchhandlung',
  'Blumenladen',
  'Supermarkt',
  'Apotheke',
  'Heim/Garten',
  'Tierbedarf',
  'Papeterie',
  'Brocki',
  'Kosmetik',
  'Getränkeladen',
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
  'Physiotherapie',
  'Fitnessstudio',
  'Optiker',
  'Autowaschanlage',
  'Konzert',
  'Festival',
  'Party',
  'Markt',
  'Ausstellung',
  'Kino',
  'Theater',
  'Sportevent',
] as const;

export type ShopCategory = (typeof shopCategoryLabels)[number];

export const mapIconIds = [
  'kleiderladen',
  'schuhladen',
  'schmuckladen',
  'elektronikladen',
  'buchhandlung',
  'blumenladen',
  'supermarkt',
  'apotheke',
  'heim-garten',
  'tierbedarf',
  'papeterie',
  'brocki',
  'kosmetik',
  'getraenkeladen',
  'restaurant',
  'cafe',
  'bar',
  'pizzeria',
  'baeckerei',
  'konditorei',
  'eisdiele',
  'fast-food',
  'coiffeur',
  'nagelstudio',
  'kosmetikstudio',
  'massage',
  'physiotherapie',
  'fitnessstudio',
  'optiker',
  'autowaschanlage',
  'konzert',
  'festival',
  'party',
  'markt',
  'ausstellung',
  'kino',
  'theater',
  'sportevent',
] as const;

export type MapIcon = (typeof mapIconIds)[number];

export type DayOpening = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export type OpeningHours = {
  monday: DayOpening;
  tuesday: DayOpening;
  wednesday: DayOpening;
  thursday: DayOpening;
  friday: DayOpening;
  saturday: DayOpening;
  sunday: DayOpening;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price?: string;
  imageUrl?: string;
};

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  priceFrom?: string;
  durationMinutes?: number;
};

export type ShopProfile = {
  id: string;
  ownerUserId: string;
  name: string;
  category: ShopCategory;
  description: string;
  slogan: string;
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  openingHours: OpeningHours;
  products: Product[];
  services: ServiceItem[];
  logoUrl: string;
  heroImageUrl: string;
  galleryImageUrls: string[];
  mapIcon: MapIcon;
  subscriptionStatus: SubscriptionStatus;
  adminApproved: boolean;
  isVisibleOnMap: boolean;
  createdAt: string;
  updatedAt: string;
};
