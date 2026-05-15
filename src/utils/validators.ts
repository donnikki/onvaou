import { ShopCategory } from '@/src/types';

export const categoryList: ShopCategory[] = [
  'Café',
  'Restaurant',
  'Bar',
  'Club',
  'Coiffeur',
  'Supermarkt',
  'Event',
  'Dienstleistung',
  'Sonstiges',
];

const phoneRegex = /^[0-9+()\-\s]{8,20}$/;

export const isValidEmail = (value: string) => /.+@.+\..+/.test(value);

export const isValidPhone = (value: string) => phoneRegex.test(value.trim());

export const isRequired = (value: string) => value.trim().length > 0;
