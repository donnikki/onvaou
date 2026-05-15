import { usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, typography } from '@/src/theme';

const getPageTypeLetter = (pathname: string) => {
  if (pathname === '/' || pathname.startsWith('/onboarding')) {
    return 'A';
  }

  if (
    pathname === '/discover' ||
    pathname === '/deals' ||
    pathname === '/favorites' ||
    pathname === '/wallet' ||
    pathname === '/profile' ||
    pathname === '/explore'
  ) {
    return 'B';
  }

  if (pathname.startsWith('/shop/')) {
    return 'C';
  }

  if (pathname.startsWith('/admin/')) {
    return 'D';
  }

  if (pathname.startsWith('/shop-detail/')) {
    return 'E';
  }

  return 'Z';
};

export function PageTypeBadge() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const letter = getPageTypeLetter(pathname);

  return (
    <View pointerEvents="none" style={[styles.container, { top: insets.top + 8 }]}>
      <View style={styles.badge}>
        <Text style={styles.text}>{letter}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 14,
    zIndex: 9999,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: typography.family.bold,
    fontSize: typography.size.md,
    lineHeight: 18,
  },
});
