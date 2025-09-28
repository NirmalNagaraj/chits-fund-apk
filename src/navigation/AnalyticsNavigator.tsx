import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';

const Stack = createStackNavigator();

const AnalyticsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="AnalyticsMain" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
    </Stack.Navigator>
  );
};

export default AnalyticsNavigator;