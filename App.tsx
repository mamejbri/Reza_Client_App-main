import React, { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocaleConfig } from 'react-native-calendars';

import "./global.css";
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
   🎨 App Theme
===================================================== */
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
  },
};

/* =====================================================
   🚀 App Component
===================================================== */
const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();

        if (token) {
          // 🔐 Restore axios header
          http.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.log('Session restore failed:', e);
      } finally {
        setIsReady(true);
      }
    };

    restoreSession();
  }, []);

  // 🔥 Prevent rendering navigation before session is restored
  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
