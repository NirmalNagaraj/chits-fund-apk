import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChitsStackParamList } from '../types';

import ChitsOverviewScreen from '../screens/Chits/ChitsOverviewScreen';
import ChitPaymentScreen from '../screens/Chits/ChitPaymentScreen';

const Stack = createStackNavigator<ChitsStackParamList>();

const ChitsNavigator: React.FC = () => {
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
        name="ChitsOverview" 
        component={ChitsOverviewScreen}
        options={{ title: 'Chit Funds' }}
      />
      <Stack.Screen 
        name="ChitPayment" 
        component={ChitPaymentScreen}
        options={{ title: 'Chit Payment' }}
      />
    </Stack.Navigator>
  );
};

export default ChitsNavigator;