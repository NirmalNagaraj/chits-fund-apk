import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { UsersStackParamList } from '../types';

import UsersListScreen from '../screens/Users/UsersListScreen';
import UserDetailsScreen from '../screens/Users/UserDetailsScreen';
import UserOnboardScreen from '../screens/Users/UserOnboardScreen';

const Stack = createStackNavigator<UsersStackParamList>();

const UsersNavigator: React.FC = () => {
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
                name="UsersList"
                component={UsersListScreen}
                options={{ title: 'Users' }}
            />
            <Stack.Screen
                name="UserDetails"
                component={UserDetailsScreen}
                options={{ title: 'User Details' }}
            />
            <Stack.Screen
                name="UserOnboard"
                component={UserOnboardScreen}
                options={{ title: 'Add New User' }}
            />
        </Stack.Navigator>
    );
};

export default UsersNavigator;