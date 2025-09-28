import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootTabParamList } from '../types';

// Import stack navigators
import DashboardNavigator from './DashboardNavigator';
import UsersNavigator from './UsersNavigator';
import ChitsNavigator from './ChitsNavigator';
import LoansNavigator from './LoansNavigator';
import AnalyticsNavigator from './AnalyticsNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Users':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Chits':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Loans':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Users" 
        component={UsersNavigator}
        options={{ tabBarLabel: 'Users' }}
      />
      <Tab.Screen 
        name="Chits" 
        component={ChitsNavigator}
        options={{ tabBarLabel: 'Chits' }}
      />
      <Tab.Screen 
        name="Loans" 
        component={LoansNavigator}
        options={{ tabBarLabel: 'Loans' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsNavigator}
        options={{ tabBarLabel: 'Analytics' }}
      />
    </Tab.Navigator>
  );
};

export default RootNavigator;