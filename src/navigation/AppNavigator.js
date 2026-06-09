import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Login';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return null; // AuthProvider handles the loading UI
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {currentUser ? (
                    <Stack.Screen name="Home" component={HomeScreen} />
                ) : (
                    <Stack.Screen
                        name="Login"
                        component={Login}
                        options={{ animationTypeForReplace: 'pop' }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
