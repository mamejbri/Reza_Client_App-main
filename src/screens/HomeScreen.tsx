// src/screens/HomeScreen.tsx
import React from 'react';
import {
  Text,
  Pressable,
  ImageBackground,
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const horizontalPadding = 16;
  const gap = 14;

  const cardWidth = isTablet
    ? (width - horizontalPadding * 2 - gap) / 2
    : width - horizontalPadding * 2;

  const aspectRatio = 16 / 9;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView />

      <Text style={styles.title}>On réserve quoi ?</Text>

      <View style={[styles.grid, { paddingHorizontal: horizontalPadding, gap }]}>
        {categories.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              navigation.navigate('SearchResults', { type: item.type })
            }
            style={[
              styles.card,
              {
                width: cardWidth,
                aspectRatio,
              },
            ]}
          >
            <ImageBackground
          source={item.image}
          resizeMode="cover"
          style={styles.image}
        >
              {/* semi-transparent overlay */}
              <View style={styles.overlay} />

              {/* label */}
              <View style={styles.center}>
                <Text style={styles.cardText}>{item.label}</Text>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  title: {
    textAlign: 'center',
    fontSize: 26,
    fontFamily: 'Montserrat-Bold',
    marginVertical: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000', // ✅ background for contain
  },

  image: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  cardText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
