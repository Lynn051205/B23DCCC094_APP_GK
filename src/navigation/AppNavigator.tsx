import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {RootStackParamList, RootTabParamList} from './routes';
import {
  AssignmentDetailScreen,
  AssignmentsScreen,
  CourseDetailScreen,
  CoursesScreen,
  EditProfileScreen,
  GradeDetailScreen,
  OverviewScreen,
  ProfileScreen,
  ScheduleDetailScreen,
  ScheduleScreen,
} from '../screens/AppScreens';
import {colors, radii, typography} from '../theme';

const Tabs = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabAppearance = {
  Overview: {label: 'Tổng quan', glyph: '⌂'},
  Courses: {label: 'Môn học', glyph: '▤'},
  Schedule: {label: 'Lịch học', glyph: '▦'},
  Assignments: {label: 'Bài tập', glyph: '✓'},
  Profile: {label: 'Cá nhân', glyph: '○'},
} as const;

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      initialRouteName="Overview"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarLabel: tabAppearance[route.name].label,
        // The tab icon element is rebuilt by React Navigation as tab state changes.
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({focused}) =>
          React.createElement(
            View,
            {style: [styles.glyphWrap, focused && styles.glyphWrapActive]},
            React.createElement(
              Text,
              {style: [styles.glyph, focused && styles.glyphActive]},
              tabAppearance[route.name].glyph,
            ),
          ),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 64 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
      })}>
      <Tabs.Screen name="Overview" component={OverviewScreen} />
      <Tabs.Screen name="Courses" component={CoursesScreen} />
      <Tabs.Screen name="Schedule" component={ScheduleScreen} />
      <Tabs.Screen name="Assignments" component={AssignmentsScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.text,
        headerTitleStyle: {color: colors.text, fontSize: typography.subheading, fontWeight: '800'},
        headerShadowVisible: false,
        contentStyle: {backgroundColor: colors.background},
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{title: 'Chi tiết môn học'}}
      />
      <Stack.Screen
        name="ScheduleDetail"
        component={ScheduleDetailScreen}
        options={{title: 'Chi tiết buổi học'}}
      />
      <Stack.Screen
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{title: 'Chi tiết bài tập'}}
      />
      <Stack.Screen
        name="GradeDetail"
        component={GradeDetailScreen}
        options={{title: 'Chi tiết kết quả'}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Chỉnh sửa hồ sơ'}}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    paddingTop: 6,
  },
  tabItem: {paddingVertical: 2},
  tabLabel: {fontSize: 10, fontWeight: '700'},
  glyphWrap: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 28,
    justifyContent: 'center',
    width: 42,
  },
  glyphWrapActive: {backgroundColor: colors.primary},
  glyph: {color: colors.textSecondary, fontSize: 18, fontWeight: '700'},
  glyphActive: {color: colors.text},
});

export default AppNavigator;
