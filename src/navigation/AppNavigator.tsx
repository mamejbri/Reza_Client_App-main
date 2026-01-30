import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import ReservationDetailScreen from '../screens/ReservationDetailScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import EstablishmentBookingScreen from '../screens/EstablishmentBookingScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

import Navbar from '../../components/Navbar';
import type { RootStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const renderHeader = useCallback(
    ({ route }: NativeStackHeaderProps) => (
      <Navbar currentRoute={route.name} />
    ),
    []
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: renderHeader,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EstablishmentBooking" component={EstablishmentBookingScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
