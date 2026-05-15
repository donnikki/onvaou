import { SubscriptionStatus } from './subscription';

export type ShopCategory =
  | 'Café'
  | 'Restaurant'
  | 'Bar'
  | 'Club'
  | 'Coiffeur'
  | 'Supermarkt'
  | 'Event'
  | 'Dienstleistung'
  | 'Sonstiges';

export type MapIcon =
  | 'scissors'
  | 'shopping-cart'
  | 'beer'
  | 'coffee'
  | 'utensils'
  | 'music'
  | 'ticket'
  | 'wrench'
  | 'map-pin';

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
