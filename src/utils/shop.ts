import { OpeningHours } from '@/src/types';

export { categoryToMapIcon } from '@/src/utils/shopCategories';

export const defaultOpeningHours: OpeningHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '18:00' },
  sunday: { isOpen: false, openTime: '00:00', closeTime: '00:00' },
};
