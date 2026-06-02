import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GlobalRoleSelectionBackButton } from '@/src/components/navigation/GlobalRoleSelectionBackButton';
import { LiveContentBootstrap } from '@/src/components/providers/LiveContentBootstrap';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LiveContentBootstrap>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
            animation: 'slide_from_right',
            gestureEnabled: false,
            fullScreenGestureEnabled: false,
            gestureDirection: 'horizontal',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="help" />
          <Stack.Screen name="portal-access" />
          <Stack.Screen
            name="shop-detail/[id]"
            options={{
              presentation: 'card',
              gestureEnabled: true,
              fullScreenGestureEnabled: true,
              headerShown: true,
              headerTitle: '',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: '#FFFFFF' },
            }}
          />
        </Stack>
        <GlobalRoleSelectionBackButton />
        <StatusBar style="dark" />
      </LiveContentBootstrap>
    </GestureHandlerRootView>
  );
}
