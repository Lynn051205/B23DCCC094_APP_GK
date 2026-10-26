import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {AppDataProvider} from './src/state/AppDataContext';
import {OfflineBanner} from './src/components/OfflineBanner';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppDataProvider>
        <View style={styles.container}>
          <OfflineBanner />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </View>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({container: {flex: 1}});

export default App;
