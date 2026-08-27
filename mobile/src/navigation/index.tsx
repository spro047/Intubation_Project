import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { LayoutDashboard, History, FileText, Settings as SettingsIcon, Stethoscope } from 'lucide-react-native';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';

import LoginScreen from '@/screens/auth/LoginScreen';
import DashboardScreen from '@/screens/home/DashboardScreen';
import AssessmentScreen from '@/screens/home/AssessmentScreen';
import PredictionResultScreen from '@/screens/home/PredictionResultScreen';
import HistoryScreen from '@/screens/history/HistoryScreen';
import ReportsScreen from '@/screens/reports/ReportsScreen';
import ReportDetailScreen from '@/screens/reports/ReportDetailScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import AboutScreen from '@/screens/settings/AboutScreen';

import type { PredictionInput, PredictionResponse, PredictionHistory } from '@/types';

export type HomeStackParamList = {
  Dashboard: undefined;
  Assessment: { initialData?: PredictionInput } | undefined;
  PredictionResult: { result: PredictionResponse; input: PredictionInput };
  ReportDetail: { prediction: PredictionHistory };
};

export type HistoryStackParamList = {
  History: undefined;
  ReportDetail: { prediction: PredictionHistory };
};

export type ReportsStackParamList = {
  Reports: undefined;
  ReportDetail: { prediction: PredictionHistory };
};

export type SettingsStackParamList = {
  Settings: undefined;
  About: undefined;
};

export type TabParamList = {
  Home: undefined;
  Records: undefined;
  Reports: undefined;
  Settings: undefined;
};

const HomeStackNav = createNativeStackNavigator<HomeStackParamList>();
const HistoryStackNav = createNativeStackNavigator<HistoryStackParamList>();
const ReportsStackNav = createNativeStackNavigator<ReportsStackParamList>();
const SettingsStackNav = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStackNav.Screen name="Assessment" component={AssessmentScreen} />
      <HomeStackNav.Screen name="PredictionResult" component={PredictionResultScreen} />
      <HomeStackNav.Screen name="ReportDetail" component={ReportDetailScreen} />
    </HomeStackNav.Navigator>
  );
}

function HistoryStack() {
  return (
    <HistoryStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStackNav.Screen name="History" component={HistoryScreen} />
      <HistoryStackNav.Screen name="ReportDetail" component={ReportDetailScreen} />
    </HistoryStackNav.Navigator>
  );
}

function ReportsStack() {
  return (
    <ReportsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ReportsStackNav.Screen name="Reports" component={ReportsScreen} />
      <ReportsStackNav.Screen name="ReportDetail" component={ReportDetailScreen} />
    </ReportsStackNav.Navigator>
  );
}

function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="Settings" component={SettingsScreen} />
      <SettingsStackNav.Screen name="About" component={AboutScreen} />
    </SettingsStackNav.Navigator>
  );
}

function MainTabs() {
  const { c, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#111111',
        tabBarInactiveTintColor: c.neutral[400],
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopWidth: 2,
          borderTopColor: isDark ? c.neutral[600] : '#111111',
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
        },
        tabBarIcon: ({ color, focused }) => {
          let Icon: any = LayoutDashboard;
          if (route.name === 'Home') Icon = LayoutDashboard;
          else if (route.name === 'Records') Icon = History;
          else if (route.name === 'Reports') Icon = FileText;
          else if (route.name === 'Settings') Icon = SettingsIcon;
          return (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: focused ? 2 : 0,
                borderColor: isDark ? c.neutral[600] : '#111111',
                backgroundColor: focused ? c.brand[500] : 'transparent',
              }}
            >
              <Icon size={20} color={focused ? '#111111' : color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Records" component={HistoryStack} options={{ title: 'Records' }} />
      <Tab.Screen name="Reports" component={ReportsStack} options={{ title: 'Reports' }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  const { c } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: '#111111' }]}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          backgroundColor: '#111111',
          borderWidth: 2,
          borderColor: c.neutral[600],
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#FFD900',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        }}
      >
        <Stethoscope size={30} color="#FFFFFF" />
      </View>
      <ActivityIndicator color={c.brand[500]} style={{ marginTop: 20 }} size="large" />
    </View>
  );
}

function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const { c, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});