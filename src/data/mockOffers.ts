import { Offer } from '@/src/types';

const now = new Date();
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

export const mockOffers: Offer[] = [
  {
    id: 'offer-choppers-cut',
    shopId: 'shop-choppers',
    title: '20% auf Herrenhaarschnitt',
    description: 'Gueltig auf einen regulären Herrenhaarschnitt inklusive Styling.',
    type: 'percent',
    discountPercent: 20,
    validUntil: nextWeek,
    status: 'active',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 'offer-lago-coffee',
    shopId: 'shop-lago',
    title: '2 fuer 1 Cappuccino',
    description: 'Jeden Nachmittag zwischen 14 und 17 Uhr fuer alle Cappuccino-Liebhaber.',
    type: 'two_for_one',
    validUntil: nextTwoWeeks,
    status: 'active',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];
