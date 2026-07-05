import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// @ts-ignore
const oldTextRender = Text.render;
// @ts-ignore
Text.render = function(...args) {
  const origin = oldTextRender.call(this, ...args);
  return React.cloneElement(origin, {
    style: [{ fontFamily: 'GoogleSans' }, origin.props.style]
  });
};


export default function Layout() {
  const [loaded, error] = useFonts({
    'GoogleSans': require('../assets/GoogleSans-Medium.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
