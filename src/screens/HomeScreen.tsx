// src/screens/HomeScreen.tsx
import React, { useMemo } from 'react';
import {
  Text,
  Pressable,
  ImageBackground,
  View,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { EstablishmentType, ESTABLISHMENT_LABELS } from '../../types/establishment';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const categories = [
  {
    id: '1',
    type: EstablishmentType.RESTAURANT,
    label: ESTABLISHMENT_LABELS[EstablishmentType.RESTAURANT],
    image: require('../../assets/images/background.jpg'),
  },
  {
    id: '2',
    type: EstablishmentType.SPA,
    label: ESTABLISHMENT_LABELS[EstablishmentType.SPA],
    image: require('../../assets/images/coiffeur-bg.jpg'),
  },
  {
    id: '3',
    type: EstablishmentType.ACTIVITY,
    label: ESTABLISHMENT_LABELS[EstablishmentType.ACTIVITY],
    image: require('../../assets/images/activites-bg.jpg'),
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const { height } = Dimensions.get('window');
  const safeTop = Platform.select({ ios: 20, android: 8, default: 8 });

  // Title + spacing
  const headerHeight = 60;
  const totalVerticalPadding = (safeTop ?? 8) + 100;

  // Space available for the 3 cards (NO scroll)
  const availableHeight = height - (headerHeight + totalVerticalPadding);

  // Each card takes exactly 1/3 of the remaining height
  const cardHeight = useMemo(
    () => Math.max(140, Math.floor(availableHeight / 3)),
    [availableHeight]
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView />

      {/* HEADER TITLE */}
      <View style={{ height: headerHeight, justifyContent: 'center' }}>
        <Text className="text-center text-2xl font-extrabold tracking-tight mt-2"style={{ fontFamily: 'Montserrat-Bold' }}>
          On réserve quoi ?
        </Text>
      </View>

      {/* FIXED 3 SECTIONS – NO SCROLL */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 20 }}>
        {categories.map((item, idx) => (
          <Pressable
            key={item.id}
            onPress={() => {
              requestAnimationFrame(() => {
                navigation.navigate("SearchResults", {
                  type: item.type,
                });
              });
            }}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            style={{
              height: cardHeight,
              marginBottom: idx === categories.length - 1 ? 0 : 12,
            }}
            className="rounded-2xl overflow-hidden shadow"
            
          >
            <ImageBackground
              source={item.image}
              resizeMode="cover"
              style={{ flex: 1 }}
            >
              {/* Overlay */}
              <View style={StyleSheet.absoluteFillObject} className="bg-black/40" />

              {/* Centered label */}
              <View
                style={StyleSheet.absoluteFillObject}
                className="items-center justify-center px-4"
              >
                <Text
                  className="text-white font-extrabold text-center"
                  style={{
                    fontSize: 24,
                    fontFamily: 'Montserrat-Bold',
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,

                  }}
                >
                  {item.label}
                </Text>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
