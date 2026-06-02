import { Redirect } from 'expo-router';

export default function ShopLayout() {
  return <Redirect href="/portal-access?role=shop" />;
}
