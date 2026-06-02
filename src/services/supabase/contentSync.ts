import { mockOffers } from '@/src/data/mockOffers';
import { mockShops } from '@/src/data/mockShops';
import { Offer, ShopProfile } from '@/src/types';
import { normalizeShopProfiles } from '@/src/utils/shopCategories';

import { isSupabaseConfigured, supabase } from './client';

type ShopRow = {
  id: string;
  owner_user_id: string;
  name: string;
  category: ShopProfile['category'];
  description: string;
  slogan: string;
  street: string;
  house_number: string;
  zip: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string | null;
  opening_hours: ShopProfile['openingHours'];
  products: ShopProfile['products'];
  services: ShopProfile['services'];
  logo_url: string;
  hero_image_url: string;
  gallery_image_urls: string[];
  map_icon: ShopProfile['mapIcon'];
  subscription_status: ShopProfile['subscriptionStatus'];
  admin_approved: boolean;
  is_visible_on_map: boolean;
  created_at: string;
  updated_at: string;
};

type OfferRow = {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  type: Offer['type'];
  discount_percent: number | null;
  free_item: string | null;
  purchase_requirement: string | null;
  fixed_price_label: string | null;
  bundle_details: string | null;
  max_redemptions: number | null;
  inventory_total: number | null;
  reward_label: string | null;
  friends_required: number | null;
  points_reward: number | null;
  promotion: Offer['promotion'] | null;
  valid_until: string;
  status: Offer['status'];
  created_at: string;
  updated_at: string;
};

const fallbackShops = normalizeShopProfiles(mockShops);
const fallbackOffers = mockOffers;

const mapShopRow = (row: ShopRow): ShopProfile => ({
  id: row.id,
  ownerUserId: row.owner_user_id,
  name: row.name,
  category: row.category,
  description: row.description,
  slogan: row.slogan,
  street: row.street,
  houseNumber: row.house_number,
  zip: row.zip,
  city: row.city,
  country: row.country,
  latitude: row.latitude,
  longitude: row.longitude,
  phone: row.phone,
  email: row.email,
  website: row.website ?? undefined,
  openingHours: row.opening_hours,
  products: row.products ?? [],
  services: row.services ?? [],
  logoUrl: row.logo_url,
  heroImageUrl: row.hero_image_url,
  galleryImageUrls: row.gallery_image_urls ?? [],
  mapIcon: row.map_icon,
  subscriptionStatus: row.subscription_status,
  adminApproved: row.admin_approved,
  isVisibleOnMap: row.is_visible_on_map,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapOfferRow = (row: OfferRow): Offer => ({
  id: row.id,
  shopId: row.shop_id,
  title: row.title,
  description: row.description,
  type: row.type,
  discountPercent: row.discount_percent ?? undefined,
  freeItem: row.free_item ?? undefined,
  purchaseRequirement: row.purchase_requirement ?? undefined,
  fixedPriceLabel: row.fixed_price_label ?? undefined,
  bundleDetails: row.bundle_details ?? undefined,
  maxRedemptions: row.max_redemptions ?? undefined,
  inventoryTotal: row.inventory_total ?? undefined,
  rewardLabel: row.reward_label ?? undefined,
  friendsRequired: row.friends_required ?? undefined,
  pointsReward: row.points_reward ?? undefined,
  promotion: row.promotion ?? undefined,
  validUntil: row.valid_until,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fetchShops = async () => {
  if (!supabase) {
    return fallbackShops;
  }

  const { data, error } = await supabase.from('shops').select('*').order('name', { ascending: true });
  if (error) {
    throw error;
  }

  return normalizeShopProfiles((data as ShopRow[]).map(mapShopRow));
};

const fetchOffers = async () => {
  if (!supabase) {
    return fallbackOffers;
  }

  const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
  if (error) {
    throw error;
  }

  return (data as OfferRow[]).map(mapOfferRow);
};

export const liveContentService = {
  isEnabled() {
    return isSupabaseConfigured;
  },

  async loadAll() {
    if (!supabase) {
      return {
        shops: fallbackShops,
        offers: fallbackOffers,
      };
    }

    const [shops, offers] = await Promise.all([fetchShops(), fetchOffers()]);

    return {
      shops,
      offers,
    };
  },

  subscribe(onChange: () => void) {
    const supabaseClient = supabase;

    if (!supabaseClient) {
      return () => undefined;
    }

    const channel = supabaseClient
      .channel('biel-live-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, onChange)
      .subscribe();

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  },
};
