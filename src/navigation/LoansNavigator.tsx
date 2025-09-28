import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoansStackParamList } from '../types';

import LoansOverviewScreen from '../screens/Loans/LoansOverviewScreen';
import LoanApplicationScreen from '../screens/Loans/LoanApplicationScreen';
import LoanPaymentScreen from '../screens/Loans/LoanPaymentScreen';

const Stack = createStackNavigator<LoansStackParamList>();

const LoansNavigator: React.FC = () => {
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
        name="LoansOverview" 
        component={LoansOverviewScreen}
        options={{ title: 'Loans' }}
      />
      <Stack.Screen 
        name="LoanApplication" 
        component={LoanApplicationScreen}
        options={{ title: 'Apply for Loan' }}
      />
      <Stack.Screen 
        name="LoanPayment" 
        component={LoanPaymentScreen}
        options={{ title: 'Loan Payment' }}
      />
    </Stack.Navigator>
  );
};

export default LoansNavigator;