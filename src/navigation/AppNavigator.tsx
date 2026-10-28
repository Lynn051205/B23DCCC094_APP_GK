import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {enableScreens} from 'react-native-screens';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './routes';
import {FieldListScreen} from '../screens/FieldListScreen';
import {FieldFormScreen} from '../screens/FieldFormScreen';
import {FieldDetailScreen} from '../screens/FieldDetailScreen';
import {useFields} from '../context/FieldContext';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const {loading} = useFields();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Đang tải dữ liệu sân...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="FieldList"
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen
        name="FieldList"
        component={FieldListScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="FieldForm"
        component={FieldFormScreen}
        options={{title: 'Thông tin sân'}}
      />
      <Stack.Screen
        name="FieldDetail"
        component={FieldDetailScreen}
        options={{title: 'Chi tiết sân'}}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
