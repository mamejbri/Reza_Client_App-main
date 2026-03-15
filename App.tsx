import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocaleConfig } from 'react-native-calendars';

import AppNavigator from './src/navigation/AppNavigator';
//import "./global.css";

import { getToken } from './services/auth';
import http from './src/api/http';

/* =====================================================
   🌍 French Calendar Locale
===================================================== */

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthNamesShort: [
    'Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'
  ],
  dayNames: [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: "Aujourd'hui"
};

LocaleConfig.defaultLocale = 'fr';

/* =====================================================
   🎨 Theme
===================================================== */

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
  },
};

/* =====================================================
   🚀 App
===================================================== */

const App: React.FC = () => {

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {

    const restoreSession = async () => {

      console.log("🔄 Restoring session...");

      try {

        const token = await getToken();

        if (token) {
          console.log("✅ Token restored");
          http.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          console.log("⚠️ No token found");
        }

      } catch (e) {

        console.log("❌ Session restore error:", e);

      } finally {

        console.log("🚀 App ready");
        setIsReady(true);

      }

    };

    restoreSession();

  }, []);

  /* Loading screen instead of blank screen */

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading REZA...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );

};

export default App;