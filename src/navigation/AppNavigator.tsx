import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  AssignmentsStackParamList,
  CoursesStackParamList,
  OverviewStackParamList,
  ProfileStackParamList,
  RootTabParamList,
  ScheduleStackParamList,
} from './routes';
import {
  AssignmentDetailScreen,
  AssignmentsScreen,
  CourseDetailScreen,
  CoursesScreen,
  CreateAssignmentScreen,
  EditProfileScreen,
  GradeDetailScreen,
  GradesScreen,
  OverviewScreen,
  ProfileScreen,
  ScheduleDetailScreen,
  ScheduleScreen,
} from '../screens/AppScreens';
import {colors, radii, typography} from '../theme';

const Tabs = createBottomTabNavigator<RootTabParamList>();
const OverviewStack = createNativeStackNavigator<OverviewStackParamList>();
const CoursesStack = createNativeStackNavigator<CoursesStackParamList>();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();
const AssignmentsStack = createNativeStackNavigator<AssignmentsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const stackOptions = {
  headerStyle: {backgroundColor: colors.background},
  headerTintColor: colors.text,
  headerTitleStyle: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: '800' as const,
  },
  headerShadowVisible: false,
  contentStyle: {backgroundColor: colors.background},
  headerBackButtonDisplayMode: 'minimal' as const,
};

function OverviewStackNavigator() {
  return (
    <OverviewStack.Navigator screenOptions={stackOptions}>
      <OverviewStack.Screen
        name="Overview"
        component={OverviewScreen}
        options={{headerShown: false}}
      />
    </OverviewStack.Navigator>
  );
}

function CoursesStackNavigator() {
  return (
    <CoursesStack.Navigator screenOptions={stackOptions}>
      <CoursesStack.Screen
        name="Courses"
        component={CoursesScreen}
        options={{headerShown: false}}
      />
      <CoursesStack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{title: 'Chi tiết môn học'}}
      />
    </CoursesStack.Navigator>
  );
}

function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator screenOptions={stackOptions}>
      <ScheduleStack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{headerShown: false}}
      />
      <ScheduleStack.Screen
        name="ScheduleDetail"
        component={ScheduleDetailScreen}
        options={{title: 'Chi tiết buổi học'}}
      />
    </ScheduleStack.Navigator>
  );
}

function AssignmentsStackNavigator() {
  return (
    <AssignmentsStack.Navigator screenOptions={stackOptions}>
      <AssignmentsStack.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{headerShown: false}}
      />
      <AssignmentsStack.Screen
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{title: 'Chi tiết bài tập'}}
      />
      <AssignmentsStack.Screen
        name="CreateAssignment"
        component={CreateAssignmentScreen}
        options={{title: 'Tạo bài tập'}}
      />
    </AssignmentsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Chỉnh sửa hồ sơ'}}
      />
      <ProfileStack.Screen
        name="Grades"
        component={GradesScreen}
        options={{title: 'Kết quả học tập'}}
      />
      <ProfileStack.Screen
        name="GradeDetail"
        component={GradeDetailScreen}
        options={{title: 'Chi tiết kết quả'}}
      />
    </ProfileStack.Navigator>
  );
}

const tabAppearance = {
  Overview: {label: 'Tổng quan', glyph: '⌂'},
  Courses: {label: 'Môn học', glyph: '▤'},
  Schedule: {label: 'Lịch học', glyph: '▦'},
  Assignments: {label: 'Bài tập', glyph: '✓'},
  Profile: {label: 'Cá nhân', glyph: '○'},
} as const;

function AppNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      initialRouteName="Overview"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarLabel: tabAppearance[route.name].label,
        // The icon renderer is required to be supplied per tab by React Navigation.
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({focused}) => (
          <View style={[styles.glyphWrap, focused && styles.glyphWrapActive]}>
            <Text style={[styles.glyph, focused && styles.glyphActive]}>
              {tabAppearance[route.name].glyph}
            </Text>
          </View>
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
      <Tabs.Screen name="Overview" component={OverviewStackNavigator} />
      <Tabs.Screen name="Courses" component={CoursesStackNavigator} />
      <Tabs.Screen name="Schedule" component={ScheduleStackNavigator} />
      <Tabs.Screen name="Assignments" component={AssignmentsStackNavigator} />
      <Tabs.Screen name="Profile" component={ProfileStackNavigator} />
    </Tabs.Navigator>
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
