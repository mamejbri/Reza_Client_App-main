// src/components/Navbar.tsx

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IcoMoonIcon from '../src/icons/IcoMoonIcon';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { Image } from 'react-native';

// 🔄 CHANGED: use lightweight auth check
import { isAuthenticated } from '../services/auth';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const logo = require('../assets/images/logo.png');
const logoLight = require('../assets/images/logo-light.png');
const Navbar: React.FC<{ currentRoute: string }> = ({ currentRoute }) => {

  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

const transparentScreens = ['Booking'];
const transparent = transparentScreens.includes(currentRoute);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    isAuthenticated().then(setIsLoggedIn);
  }, []);

  return (
    <View
      className={transparent ? 'bg-transparent' : 'bg-white'}
      style={{ paddingTop: insets.top }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View className={`flex-row items-center justify-between px-4 py-3 ${transparent ? 'bg-transparent' : 'bg-white'}`}>
        {/* Left: Back or logo */}
        {currentRoute !== 'Home' ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <IcoMoonIcon name="return" size={40} color={transparent ? '#fff' : '#000'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            {transparent ? (
<Image
  source={logoLight}
  style={{ width: 80, height: 40, resizeMode: 'contain' }}
/>            ) : (
<Image
  source={logo}
  style={{ width: 80, height: 40, resizeMode: 'contain' }}
/>            )}
          </TouchableOpacity>
        )}

        {/* Center logo if back exists */}
        {currentRoute !== 'Home' && (
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            {transparent ? (
<Image
  source={logoLight}
  style={{ width: 80, height: 40, resizeMode: 'contain' }}
/>            ) : (
<Image
  source={logo}
  style={{ width: 80, height: 40, resizeMode: 'contain' }}
/>            )}
          </TouchableOpacity>
        )}

        {/* Right: Login / Profile */}
            <TouchableOpacity
              onPress={() => {
                if (isLoggedIn) {
                  navigation.navigate('Appointments');
                } else {
                  navigation.navigate('Login', {
                    redirectAfterLogin: {
                      screen: 'Appointments',
                    },
                  });
                }
              }}
              className="btn-icon"
              style={{ height: 40, width: 40 }}
            >
          <IcoMoonIcon name="profile" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(Navbar);
