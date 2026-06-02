import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, typography } from '@/src/theme';
import { resetToRoleSelection } from '@/src/utils/navigation';

const hiddenPaths = new Set([
  '/',
  '/test-launch',
  '/onboarding/welcome',
  '/onboarding/login',
  '/onboarding/role-select',
]);

export const GlobalRoleSelectionBackButton = () => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const hidden = useMemo(() => {
    if (hiddenPaths.has(pathname)) {
      return true;
    }

    return !pathname.startsWith('/onboarding/');
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (pathname === '/onboarding/role-select') {
        return true;
      }

      if (!pathname.startsWith('/onboarding/')) {
        return false;
      }

      if (pathname === '/onboarding/welcome' || pathname === '/' || pathname === '/onboarding/login') {
        return false;
      }

      resetToRoleSelection();
      return true;
    });

    return () => subscription.remove();
  }, [pathname]);

  if (hidden) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable
        style={[styles.button, { top: insets.top + 4 }]}
        onPress={resetToRoleSelection}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryRed} />
        <Text style={styles.label}>Zurueck</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 10,
    shadowColor: '#171717',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  label: {
    color: colors.primaryRed,
    fontFamily: typography.family.semibold,
    fontSize: typography.size.sm,
  },
});
