import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Image, ScrollView,
  Modal, TextInput,
  useWindowDimensions
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import IcoMoonIcon from "../icons/IcoMoonIcon";

import {
  fetchSearchEtablissements,
  EtablissementDTO
} from "../../services/etablissements";

import {
  fetchFilterGroups,
  FilterOption
} from "../../services/filters";

import { fetchReviewSummary } from "../../services/avis";

import type { RootStackParamList } from "../../types/navigation";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import { API } from "../config/env";

const ABS = /^https?:\/\//i;
const resolveImg = (p?: string) => {
  if (!p) return "";
  if (ABS.test(p)) return p;
  return API.BASE_URL.replace(/\/+$/, "") + "/" + p.replace(/^\/+/, "");
};

type Nav = NativeStackNavigationProp<RootStackParamList, "SearchResults">;
type Route = RouteProp<RootStackParamList, "SearchResults">;
/******************************************************
 * UTILITIES
 ******************************************************/
const FILTER_GROUP_LABELS: Record<string, string> = {
  REGIME_ALIMENTAIRE: "Régime alimentaire",
  CADRE_AMBIANCE: "Cadre et ambiance",
  POUR_QUI: "Pour qui ?",
  GAMME_PRODUIT: "Gamme de produit",
  ACTIVITE: "Activité",
};

const formatFilterLabel = (group: string) => {
  // Priority: explicit mapping
  if (FILTER_GROUP_LABELS[group]) {
    return FILTER_GROUP_LABELS[group];
  }

  // Fallback (safe for future groups)
  const text = group.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};
/******************************************************
 * IMAGE RESOLVER (FIXED)
 ******************************************************/
const DEFAULT_ETAB_IMAGE = require("../../assets/images/default_image.jpg");

const getFinalImage = (item: EtablissementDTO) => {
  if (item.imageUrl) return { uri: resolveImg(item.imageUrl) };

  if (item.photoPaths?.length && item.photoPaths[0])
    return { uri: resolveImg(item.photoPaths[0]) };

  const photosArray: any[] = (item as any).photos ?? [];
  if (photosArray.length && photosArray[0]?.url) {
    return { uri: resolveImg(photosArray[0].url) };
  }

  if (item.menuPhotoPaths?.length && item.menuPhotoPaths[0])
    return { uri: resolveImg(item.menuPhotoPaths[0]) };

  // ✅ fallback image
  return DEFAULT_ETAB_IMAGE;
};
/******************************************************
 * CARD (unchanged design)
 ******************************************************/
const Card = ({ item, summary, onPress }: any) => {

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-2xl bg-gray-100 mb-4 overflow-hidden"
      style={{ width: "92%", alignSelf: "center" }}
    >
      <Image
        source={getFinalImage(item)}
        style={{ width: "100%", height: 150 }}
        resizeMode="cover"
        fadeDuration={0}
        loadingIndicatorSource={undefined}
      />

      <View className="px-3 py-3">
        <Text className="text-lg font-bold">{item.nom}</Text>

       <View className="flex-row items-center mt-1">
  <IcoMoonIcon name="location" size={18} color="#C53334" />
  <Text className="text-base ml-2 text-gray-700" numberOfLines={1}>
    {item.address?.trim() || "Adresse indisponible"}
  </Text>
</View>

        <View className="flex-row items-center mt-2">
          {summary && summary.count > 0 ? (
            <>
              <IcoMoonIcon name="star" size={18} color="#C53334" />
              <Text className="ml-2 font-semibold">{summary.average.toFixed(1)}</Text>
              <Text className="ml-1 text-gray-700">• {summary.count} avis</Text>
            </>
          ) : (
            <Text className="text-gray-600">Aucun avis</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/******************************************************
 * MAIN SCREEN
 ******************************************************/
export default function SearchResultsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { type } = params;

  const [etabs, setEtabs] = useState<EtablissementDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterGroups, setFilterGroups] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<number>>(new Set());
  const [tempSelected, setTempSelected] = useState<Set<number>>(new Set());

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [summaries, setSummaries] = useState<any>({});

  const clean = (v: string) => v.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  /******************************************************
   * BUILD POST BODY
   ******************************************************/
  const buildPayload = () => {
    const payload: any = {
      text: searchText || undefined,
      type,
      cuisine: [],
      regime: [],
      ambiance: [],
      prestation: [],
      pourQui: [],
      gammeProduit: [],
      activite: [],
      environnement: []
    };

    tempSelected.forEach((id) => {
      const g = filterGroups.find((g) =>
        g.options.some((o: FilterOption) => o.id === id)
      );
      if (!g) return;

      switch (g.group) {
        case "CUISINE": payload.cuisine.push(String(id)); break;
        case "REGIME_ALIMENTAIRE": payload.regime.push(String(id)); break;
        case "CADRE_AMBIANCE": payload.ambiance.push(String(id)); break;

        case "PRESTATION": payload.prestation.push(String(id)); break;
        case "POUR_QUI": payload.pourQui.push(String(id)); break;
        case "GAMME_PRODUIT": payload.gammeProduit.push(String(id)); break;

        case "ACTIVITE": payload.activite.push(String(id)); break;
        case "ENVIRONNEMENT": payload.environnement.push(String(id)); break;
      }
    });

    return payload;
  };

  /******************************************************
   * LOAD RESULTS
   ******************************************************/
  const loadSearch = async () => {
    try {
      setLoading(true);
      const payload = buildPayload();
      const page = await fetchSearchEtablissements(payload);
      setEtabs(page.content ?? []);
    } finally {
      setLoading(false);
    }
  };

 const triggerSearch = useCallback(() => {
  loadSearch();
}, [selectedFilters, searchText]);

 useEffect(() => {
  let mounted = true;

  const init = async () => {
    const groups = await fetchFilterGroups(type);
    if (!mounted) return;

    setFilterGroups(groups);

    // ✅ defer heavy search
    setTimeout(() => {
      if (mounted) loadSearch();
    }, 0);
  };

  init();

  return () => {
    mounted = false;
  };
}, []);

  useEffect(() => {
  if (!etabs.length) return;

  let mounted = true;

  const run = async () => {
    const entries = await Promise.all(
      etabs.map(async (e) => [e.id, await fetchReviewSummary(e.id)])
    );

    if (!mounted) return;

    setSummaries(Object.fromEntries(entries));
  };

  run();

  return () => {
    mounted = false;
  };
}, [etabs]);
  /******************************************************
   * FILTER MODAL LOGIC
   ******************************************************/

  const confirmFilters = () => {
    setSelectedFilters(new Set(tempSelected));
    loadSearch();
    setModalVisible(false);
  };

  const resetGroup = () => {
    const next = new Set(tempSelected);
    const target = filterGroups.find((g) => g.group === activeGroup);
    if (target) {
      target.options.forEach((o: FilterOption) => next.delete(o.id));
    }
    setTempSelected(next);
  };

  const resetAll = () => {
    setSelectedFilters(new Set());
    setTempSelected(new Set());
    loadSearch();
  };
useEffect(() => {
  if (modalVisible) {
    setTempSelected(new Set(selectedFilters));
  }
}, [modalVisible]);
  /******************************************************
   * HEADER UI
   ******************************************************/
  const { width } = useWindowDimensions();
const isSmall = width < 360;
const searchWidth = Math.min(width * 0.7, 280); // adaptive

const Header = (
  <View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 mt-3 mb-3"
      contentContainerStyle={{
        paddingRight: 24,
        alignItems: 'center',
      }}
    >
      {/* 🔍 SEARCH BAR */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          paddingHorizontal: isSmall ? 10 : 12,
          paddingVertical: isSmall ? 10 : 12,
          marginRight: 10,
          width: searchWidth,
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <TextInput
          placeholder="Rechercher..."
          placeholderTextColor="#000"
          value={searchText}
          onChangeText={setSearchText}
          style={{
            fontSize: isSmall ? 13 : 15,
            flex: 1,
            color: '#000',
            paddingRight: 8,
          }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={triggerSearch}
        />

        <TouchableOpacity onPress={triggerSearch} hitSlop={10}>
          <IcoMoonIcon
            name="search"
            size={isSmall ? 18 : 22}
            color="#C53334"
          />
        </TouchableOpacity>
      </View>

      {/* 🧩 FILTER GROUPS */}
      {filterGroups.map((g) => (
        <TouchableOpacity
          key={g.group}
          onPress={() => {
            setActiveGroup(g.group);
            setModalVisible(true);
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: 16,
            paddingHorizontal: isSmall ? 10 : 12,
            paddingVertical: isSmall ? 10 : 12,
            marginRight: 10,
            maxWidth: width * 0.5, // ⛔ prevent overflow
          }}
          activeOpacity={0.85}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontWeight: '500',
              fontSize: isSmall ? 12 : 14,
            }}
          >
            {formatFilterLabel(g.group)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);


  /******************************************************
   * UI
   ******************************************************/
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#C53334" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={etabs}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <Card
            item={item}
            summary={summaries[item.id]}
            onPress={() =>
              navigation.navigate("EstablishmentBooking", {
                establishment: item,
                initialPeople: 2,
                initialDateISO: new Date().toISOString().slice(0, 10),
                initialTime: "",
                availableSlots: {},
              })
            }
          />
        )}
        ListHeaderComponent={Header}
       ListEmptyComponent={
    <View className="items-center justify-center py-20 px-6">
      <Text className="text-lg font-semibold text-gray-800 mb-2">
        Aucun établissement trouvé
      </Text>
      <Text className="text-center text-gray-600">
        Essayez de modifier vos filtres ou votre recherche.
      </Text>
    </View>
  }
/>

      {/* FILTER MODAL */}
<Modal
  visible={modalVisible}
  transparent
  animationType="fade"
  statusBarTranslucent
>        
<View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-2xl p-4" style={{ maxHeight: "80%" }}>
           <View className="flex-row justify-between items-center mb-3">
  <Text className="text-xl font-bold">
  {activeGroup ? formatFilterLabel(activeGroup) : ""}
</Text>

  <View className="flex-row items-center gap-4">
    {/* RESET GROUP */}
    <TouchableOpacity onPress={resetGroup}>
      <Text className="text-red-500 font-semibold">Effacer</Text>
    </TouchableOpacity>

    {/* CLOSE MODAL */}
    <TouchableOpacity onPress={() => setModalVisible(false)}>
      <Text className="text-xl font-bold text-gray-600">✕</Text>
    </TouchableOpacity>
  </View>
</View>


            <FlatList
                data={filterGroups.find(g => g.group === activeGroup)?.options ?? []}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const active = tempSelected.has(item.id);

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        const next = new Set(tempSelected);
                        next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                        setTempSelected(next);
                      }}
                      className={`px-3 py-4 rounded-xl mb-3 ${
                        active ? 'bg-[#C53334]' : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={active ? 'text-white' : 'text-black'}
                        style={{ fontSize: 16, fontWeight: '600' }}
                      >
                        {clean(item.libelle)}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

            <TouchableOpacity
              onPress={confirmFilters}
              className="bg-[#C53334] rounded-xl py-3 mt-3"
            >
              <Text className="text-center text-white font-semibold text-lg">
                Appliquer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
