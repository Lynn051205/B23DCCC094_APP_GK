import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {FieldProvider} from './src/context/FieldContext';
import {AppNavigator} from './src/navigation/AppNavigator';
import {colors} from './src/theme/colors';

const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary,
  },
};

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <FieldProvider>
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>
      </FieldProvider>
    </SafeAreaProvider>
  );
}

export default App;
