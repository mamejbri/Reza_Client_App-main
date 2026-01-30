// src/components/EditReservationForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import CustomCalendarModal from './CustomCalendarModal';
import { isoToFrDisplay } from '../utils/date';
import { getCurrentUser } from '../services/user';
import { EstablishmentType } from '../types/establishment';
import {
  fetchCategories,
  fetchPrestationsByCategory,
  PrestationCategorie,
  Prestation,
} from '../services/prestations';
import { Alert } from 'react-native';
import {
  fetchPrestationAvailability,
  fetchRestaurantAvailability,
  type RestaurantAvailabilityResponse,
} from '../services/availability';
import { isAuthenticated } from '../services/auth';
import { useNavigation } from '@react-navigation/native';

dayjs.locale('fr');
export type DayHoursDTO = {
  day?: string | null; // "MONDAY", "TUESDAY", ...
  heureOuvertureMatin?: string | null;
  heureFermetureMatin?: string | null;
  heureOuvertureMidi?: string | null;
  heureFermetureMidi?: string | null;
};


interface Props {
  establishmentType: EstablishmentType;
  etablissementId: number;
  clientId?: number;

  initialPeople?: number;
  initialDateISO: string;
  initialTime: string;

  availableSlots: Record<string, { time: string; reserved_by: string | null }[]>;
  initialProgramId?: string;

  crenau?: number | null;
  crenauUnite?: 'MINUTE' | 'HOUR' | 'DAY' | 'MONTH' | null;

  minDate?: Date | null;
  maxDate?: Date | null;

  /** ✅ ADD THIS */
  openingHours?: DayHoursDTO[];

  onConfirm: (
    people: number | undefined,
    dateISO: string,
    time: string,
    programId?: string,
    clientId?: number
  ) => Promise<void>;

  onRequireAuth: (payload: {
    establishmentId: number;
    dateISO: string;
    time: string;
    programId?: string | null;
    people?: number;
  }) => void;

  onPartySizeChange?: (people: number) => void;
}



const EditReservationForm: React.FC<Props> = ({
  establishmentType,
  etablissementId,
  initialPeople,
  initialDateISO,
  initialTime,
  availableSlots,
  initialProgramId,
  crenau,
  crenauUnite,
  minDate,
  maxDate,
  onConfirm,
  onRequireAuth,
  clientId: clientIdProp,
  onPartySizeChange,
}) => {

  const [people, setPeople] = useState<number>(initialPeople ?? 2);
  const [dateISO, setDateISO] = useState<string>(initialDateISO);
  const [time, setTime] = useState<string>(initialTime);
  const [showCal, setShowCal] = useState(false);

  const [categories, setCategories] = useState<PrestationCategorie[]>([]);
  const [prestationsByCat, setPrestationsByCat] = useState<Record<number, Prestation[]>>({});
  const [loadingCat, setLoadingCat] = useState(false);
  const [loadingPrestations, setLoadingPrestations] = useState<number | null>(null);

  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(initialProgramId ?? null);

  const [isSaving, setIsSaving] = useState(false);
  const [resolvedClientId, setResolvedClientId] = useState<number | null>(
    typeof clientIdProp === 'number' ? clientIdProp : null
  );

  // ⬇️ NEW: server slots from /availability (used for non-restaurant)
  const [serverSlots, setServerSlots] = useState<string[]>([]);
  const [availLoading, setAvailLoading] = useState(false);
  const [restaurantAvailability, setRestaurantAvailability] =
    useState<RestaurantAvailabilityResponse | null>(null);

  // modal to pick time
  const [showTimeModal, setShowTimeModal] = useState(false);

  /* ---------- people ---------- */
  const setPeopleAndEmit = (val: number) => {
    const next = Math.max(1, Math.min(20, val));
    setPeople(next);
    if (establishmentType === EstablishmentType.RESTAURANT && typeof onPartySizeChange === 'function') {
      onPartySizeChange(next);
    }
  };

  const isRestaurant = establishmentType === EstablishmentType.RESTAURANT;
  const isOther = !isRestaurant;
  const stepMinutes = useMemo(() => {
    const value = crenau ?? 30;          // default = 30
    const unit = crenauUnite ?? 'MINUTE';

    switch (unit) {
      case 'MINUTE':
        return value;
      case 'HOUR':
        return value * 60;
      case 'DAY':
        return value * 24 * 60;
      default:
        return 30;
    }
  }, [crenau, crenauUnite]);
  /* ---------- load categories (non-restaurant) ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isRestaurant) {
        try {
          setLoadingCat(true);
          const cats = await fetchCategories(etablissementId);
          if (mounted) setCategories(cats);
        } catch (e) {
          console.error('❌ fetchCategories failed', e);
        } finally {
          if (mounted) setLoadingCat(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isRestaurant, etablissementId]);

  /* ---------- resolve clientId ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof clientIdProp === 'number' && clientIdProp > 0) {
        if (mounted) setResolvedClientId(clientIdProp);
        return;
      }
      try {
        const user = await getCurrentUser(false);
        const id =
          (typeof (user as any)?.clientId === 'number' ? (user as any).clientId : undefined) ??
          (typeof (user as any)?.id === 'number' ? (user as any).id : undefined);
        if (mounted) setResolvedClientId(id ?? null);
      } catch {
        if (mounted) setResolvedClientId(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [clientIdProp]);

  const finalClientId = useMemo(() => {
    return typeof clientIdProp === 'number' && clientIdProp > 0
      ? clientIdProp
      : typeof resolvedClientId === 'number' && resolvedClientId > 0
        ? resolvedClientId
        : undefined;
  }, [clientIdProp, resolvedClientId]);

  /* ---------- expand category ---------- */
  const handleExpandCategory = async (catId: number) => {
    if (expandedCategoryId === catId) {
      setExpandedCategoryId(null);
      setSelectedProgramId(null);
      setTime('');
      setServerSlots([]); // reset server slots
      return;
    }
    setExpandedCategoryId(catId);
    setSelectedProgramId(null);
    setTime('');
    setServerSlots([]);

    if (!prestationsByCat[catId]) {
      try {
        setLoadingPrestations(catId);
        const list = await fetchPrestationsByCategory(catId);
        setPrestationsByCat((prev) => ({ ...prev, [catId]: list }));
      } catch (e) {
        console.error('❌ fetchPrestationsByCategory failed', e);
      } finally {
        setLoadingPrestations(null);
      }
    }
  };

  const selectedCategory = categories.find((c) => c.id === expandedCategoryId) || null;
  const prestations = selectedCategory ? prestationsByCat[selectedCategory.id] ?? [] : [];
  const selectedProgram = prestations.find((p) => p.id === Number(selectedProgramId)) ?? null;

  const navigation = useNavigation<any>();



  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!isRestaurant) {
        setRestaurantAvailability(null);
        return;
      }

      try {
        setAvailLoading(true);
        const resp = await fetchRestaurantAvailability(etablissementId, dateISO);
        if (!mounted) return;
        // ⚠️ VALIDATION: Ensure returned date matches requested date
        if (resp.date !== dateISO) {
          console.error(
            `❌ CRITICAL: Date mismatch! Requested ${dateISO}, but got ${resp.date}. Discarding slots.`
          );
          // Don't use mismatched slots - treat as closed
          setRestaurantAvailability({
            etablissementId,
            date: dateISO,
            open: false,
            slots: [],
            reason: 'DATE_MISMATCH_ERROR',
          });
          return;
        }

        const slots = Array.isArray(resp.slots)
          ? resp.slots.map((s) => s.toString().slice(0, 5))
          : [];

        setRestaurantAvailability({ ...resp, slots });
      } catch (e) {
        if (mounted) {
          setRestaurantAvailability({
            etablissementId,
            date: dateISO,
            open: false,
            slots: [],
            reason: 'ERROR',
          });
        }
      } finally {
        if (mounted) setAvailLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isRestaurant, etablissementId, dateISO]);

  const slotsFromAvailable: string[] = useMemo(() => {
    if (!availableSlots) return [];
    const dayEntries = availableSlots[dateISO] ?? [];
    return Array.from(
      new Set(
        dayEntries
          .map((s) => (s.time || '').toString().slice(0, 5))
          .filter((t) => t && /^\d{2}:\d{2}$/.test(t))
      )
    ).sort();
  }, [availableSlots, dateISO]);

  /* ---------- fetch availability for non-restaurant ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isOther) {
        setServerSlots([]);
        return;
      }
      if (!selectedProgramId) {
        setServerSlots([]);
        return;
      }
      try {
        setAvailLoading(true);
        const resp = await fetchPrestationAvailability(
          etablissementId,
          Number(selectedProgramId),
          dateISO,
          stepMinutes
        );
        if (!mounted) return;
        // ⚠️ VALIDATION: Ensure returned date matches requested date
        if (resp.date !== dateISO) {
          console.warn(
            `Date mismatch: requested ${dateISO}, got ${resp.date}. Discarding results.`
          );
          setServerSlots([]);
          return;
        }
        const slots = Array.isArray(resp.slots)
          ? resp.slots.map((s) => s.toString().slice(0, 5))
          : [];



        setServerSlots(slots);
      } catch (e) {
        if (mounted) setServerSlots([]); // fallback
      } finally {
        if (mounted) setAvailLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOther, selectedProgramId, etablissementId, dateISO, stepMinutes]);

  // base slots:
  // - RESTAURANT: openingHours or legacy availableSlots
  // - OTHER (SPA, etc.): prefer serverSlots from backend; fallback to openingHours or legacy
  const baseSlots: string[] = useMemo(() => {
    if (isRestaurant) {
      const slots = restaurantAvailability?.open
        ? restaurantAvailability.slots
        : [];
      console.log('🍽️ RESTAURANT SLOTS', {
        selectedDate: dateISO,
        responseDate: restaurantAvailability?.date,
        slotCount: slots.length,
        firstSlot: slots[0],
        lastSlot: slots[slots.length - 1],
      });
      return slots;
    }

    if (serverSlots.length > 0) {
      console.log('🎯 PRESTATION SLOTS', {
        selectedDate: dateISO,
        slotCount: serverSlots.length,
        firstSlot: serverSlots[0],
        lastSlot: serverSlots[serverSlots.length - 1],
      });
      return serverSlots;
    }
    return slotsFromAvailable;
  }, [isRestaurant, restaurantAvailability, serverSlots, slotsFromAvailable]);



  const finalTimeList: string[] = useMemo(() => {
    let list = [...baseSlots];

    // For restaurant: NEVER append legacy initialTime
    if (!isRestaurant && initialTime && !list.includes(initialTime)) {
      list.push(initialTime);
    }

    // Remove past slots only for today
    const todayIso = dayjs().format("YYYY-MM-DD");
    if (dateISO === todayIso) {
      const nowHm = dayjs().format("HH:mm");

      // Check for midnight wrapping (e.g. 23:00 -> 00:00)
      // Only meaningful if the list preserves shift order (like for restaurants)
      let wrapIndex = -1;
      if (list.length > 0) {
        for (let i = 0; i < list.length - 1; i++) {
          // If time decreases, we crossed midnight
          if (list[i] > list[i + 1]) {
            wrapIndex = i;
            break;
          }
        }
      }

      list = list.filter((t, index) => {
        // If we identified a wrap, slots after it are "tomorrow" -> keep them
        if (wrapIndex !== -1 && index > wrapIndex) {
          return true;
        }
        return t >= nowHm;
      });
    }

    return Array.from(new Set(list)).sort();
  }, [baseSlots, initialTime, dateISO, isRestaurant]);

  const hasAnySlots = finalTimeList.length > 0;

  /**
   * Detect if slots cross midnight (e.g., 08:00-02:00)
   * This is for UI display only - the date should NOT change
   */
  const slotsCrossMidnight = useMemo(() => {
    if (!baseSlots.length) return false;
    const firstTime = baseSlots[0];
    const lastTime = baseSlots[baseSlots.length - 1];
    // If last time < first time, it means we cross midnight
    return lastTime < firstTime;
  }, [baseSlots]);




  // Availability check per chip
  // For non-restaurant, if serverSlots is used as base, all chips in finalTimeList are valid, so just return true.


  const onSelectTime = (t: string) => {
    setTime(t);
    setShowTimeModal(false);
  };

  const onConfirmPress = async () => {
    if (!time) return;
    if (!isRestaurant && !selectedProgramId) return;

    // 🔐 AUTH CHECK (SOURCE OF TRUTH)
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      Alert.alert(
        'Connexion requise',
        'Veuillez vous connecter ou créer un compte pour confirmer votre réservation.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Se connecter',
            onPress: () => {
              navigation.navigate('Login', {
                redirect: {
                  establishmentId: etablissementId,
                  dateISO,
                  time,
                  programId: selectedProgramId,
                  people,
                },
              });
            },
          },
        ]
      );
      return;
    }

    // ✅ Authenticated → continue
    setIsSaving(true);
    try {
      // Use the selected date as-is (backend already handles overnight slots)
      await onConfirm(
        isRestaurant ? people : undefined,
        dateISO,
        time,
        selectedProgramId ?? undefined,
        finalClientId
      );
    } finally {
      setIsSaving(false);
    }
  };




  const canSubmit = !!time && (isRestaurant || !!selectedProgramId);

  /* ---------------- render ---------------- */
  return (
    <ScrollView className="mt-6 bg-[#F3F3F3] rounded-2xl" keyboardShouldPersistTaps="handled"
      style={{ padding: 12 }}
    >
      <Text className="text-base font-semibold mb-3">Réserver</Text>
      <View className="rounded-2xl p-4 mb-4">

        {/* Restaurant flow */}
        {isRestaurant && (
          <View className=" rounded-2xl p-3 mb-3">
            <View className="flex-row items-center justify-between px-2 py-2 bg-[#F3F3F3] rounded-2xl">

              {/* Texte à gauche */}
              <Text className="text-base font-semibold flex-1">
                Nombre de personnes :
              </Text>

              {/* Bouton - */}
              <TouchableOpacity
                onPress={() => setPeopleAndEmit((people ?? 1) - 1)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: '#C53334' }}
                activeOpacity={0.8}
              >
                <Text className="text-xl font-extrabold text-white">−</Text>
              </TouchableOpacity>

              {/* Nombre (fond blanc, pas arrondi) */}
              <View className="px-4 py-1 bg-white mx-2">
                <Text className="text-xl font-extrabold text-black">
                  {people ?? 1}
                </Text>
              </View>

              {/* Bouton + */}
              <TouchableOpacity
                onPress={() => setPeopleAndEmit((people ?? 1) + 1)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: '#C53334' }}
                activeOpacity={0.8}
              >
                <Text className="text-xl font-extrabold text-white">+</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        {/* Non-restaurant flow */}
        {!isRestaurant && (
          <View className="bg-white rounded-2xl p-3 mb-3">
            {loadingCat && <ActivityIndicator size="small" color="#C53334" />}

            {!loadingCat && categories.length === 0 && (
              <Text className="text-sm text-gray-600 italic">
                Cet établissement n’a pas encore créé des catégories.
              </Text>
            )}

            {categories.map((cat) => (
              <View key={cat.id} className="mb-3">
                <TouchableOpacity
                  onPress={() => handleExpandCategory(cat.id)}
                  className="bg-[#F3F3F3] rounded-xl p-3"
                >
                  <Text className="text-base font-semibold">{cat.nom}</Text>
                </TouchableOpacity>

                {expandedCategoryId === cat.id && (
                  <View className="mt-2 pl-4">
                    {loadingPrestations === cat.id ? (
                      <ActivityIndicator size="small" color="#C53334" />
                    ) : (prestationsByCat[cat.id] ?? []).length === 0 ? (
                      <Text className="text-sm text-gray-600 italic">
                        Aucune prestation dans cette catégorie
                      </Text>
                    ) : (
                      (prestationsByCat[cat.id] ?? []).map((p) => {
                        const selected = selectedProgramId === String(p.id);

                        return (
                          <TouchableOpacity
                            key={p.id}
                            activeOpacity={0.9}
                            onPress={() => {
                              setSelectedProgramId(String(p.id));
                              setTime('');
                              setServerSlots([]);
                            }}
                            className={`rounded-xl p-3 mb-2 ${selected ? 'bg-[#C53334]' : 'bg-[#F3F3F3]'
                              }`}
                          >
                            <Text
                              className={`text-base font-semibold ${selected ? 'text-white' : 'text-black'
                                }`}
                            >
                              {p.nom}
                            </Text>

                            <Text
                              className={`text-sm mt-1 ${selected ? 'text-white/90' : 'text-gray-600'
                                }`}
                            >
                              {p.description}
                            </Text>

                            <Text
                              className={`text-sm font-medium mt-1 ${selected ? 'text-white' : 'text-gray-800'
                                }`}
                            >
                              {p.prixFixe ?? p.prixMin ?? 0} MAD • {p.durationMinutes} min
                            </Text>
                          </TouchableOpacity>
                        );
                      })

                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Date */}
        {((!isRestaurant && selectedProgramId) || isRestaurant) && (
          <View className="bg-white rounded-2xl p-3 mb-3">
            <Text className="text-base font-semibold mb-2">Pour</Text>

            <TouchableOpacity
              onPress={() => setShowCal(true)}
              className="bg-[#F3F3F3] rounded-2xl px-4 py-3 items-center justify-center"
              activeOpacity={0.9}
            >
              <Text className="text-[15px] font-semibold text-center">
                {(() => {
                  const today = dayjs().format('YYYY-MM-DD');
                  const isToday = dateISO === today;
                  const base = isoToFrDisplay(dateISO);
                  return isToday ? `Aujourd’hui. ${base}` : base;
                })()}
              </Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Time picker button */}
        {((!isRestaurant && selectedProgramId) || isRestaurant) && (
          <View className="bg-[#F3F3F3] rounded-2xl p-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-medium">Heure</Text>
              {availLoading && !isRestaurant && (
                <Text className="text-xs text-gray-500">Vérification des disponibilités…</Text>
              )}
            </View>

            {/* Current selection */}
            {time ? (
              <View className="mb-3 bg-[#F3F3F3] rounded-2xl px-4 py-3">
                <Text className="text-[15px] font-medium">Heure sélectionnée : {time}</Text>
              </View>
            ) : (
              <Text className="text-sm text-gray-500 mb-3">Aucune heure sélectionnée.</Text>
            )}

            <TouchableOpacity
              onPress={() => setShowTimeModal(true)}
              disabled={!hasAnySlots}
              className={`rounded-2xl py-3 items-center ${
                !hasAnySlots ? 'bg-gray-300' : 'bg-[#C53334]'
              }`}
            >
              <Text className="text-white text-base font-semibold">
                {time ? 'Modifier l’horaire' : 'Sélectionner l’horaire'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Confirm */}
      <TouchableOpacity
        onPress={onConfirmPress}
        disabled={isSaving || !canSubmit}
        className={`rounded-2xl bg-[#C53334] py-4 items-center mb-6 ${isSaving || !canSubmit ? 'opacity-60' : ''
          }`}
      >
        <Text className="text-white text-base font-semibold">
          Confirmer ma REZA
        </Text>
      </TouchableOpacity>

      {/* Calendar modal */}
      <CustomCalendarModal
        visible={showCal}
        onClose={() => setShowCal(false)}
        onSelectDate={(iso) => {
          console.log('📅 DATE SELECTED:', iso);
          setDateISO(iso);
          setTime('');
          setServerSlots([]); // reset slots when date changes
        }}
        selectedDate={dateISO}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        disabledDates={[]}
      />

      {/* Time selection modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTimeModal(false)}

      >

        <View className="flex-1 bg-black/40 justify-end"

        >
          <View
            className="bg-white rounded-t-2xl p-4"
            style={{
              maxHeight: '75%',
              width: '100%',
              padding: 20,
              flexShrink: 1,
              flexGrow: 0,
            }}
          >
            <View className="items-center mb-2">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            <Text className="text-lg font-semibold mb-2">Sélectionnez un horaire</Text>
            <Text className="text-xs text-gray-500 mb-3">
              {isoToFrDisplay(dateISO)}
              {selectedProgram ? ` • ${selectedProgram.nom}` : ''}
            </Text>
            {/* Show info if slots cross midnight */}
              <Text className="text-xs text-blue-600 mb-2 italic">
                ℹ️ Si vous cherchez un créneau après minuit, veuillez sélectionner le jour suivant.

              </Text>
            {isRestaurant && restaurantAvailability?.open === false && (
              <Text className="text-sm text-red-600 italic mb-3 text-center">
                L’établissement est fermé ce jour-là.
              </Text>
            )}
            <ScrollView className="mb-3"

            >
              {/* Morning / Afternoon sections or single list */}
              <Text className="font-semibold mb-2">Créneaux disponibles</Text>

              <View className="flex-row flex-wrap gap-2 justify-center">
                {finalTimeList.map((t) => {
                  const active = t === time;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => onSelectTime(t)}
                      className={`px-4 py-2 rounded-full border ${active
                        ? 'bg-[#C53334] border-[#C53334]'
                        : 'bg-white border-gray-300'
                        }`}
                    >
                      <Text className={active ? 'text-white font-medium' : 'text-black font-medium'}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {finalTimeList.length === 0 && (
                  <Text className="text-sm text-gray-500 italic">
                    Aucun créneau disponible.
                  </Text>
                )}
              </View>

            </ScrollView>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowTimeModal(false)}
                className="flex-1 rounded-2xl bg-gray-200 py-3 items-center"
              >
                <Text className="text-black text-base font-semibold">Fermer</Text>
              </TouchableOpacity>
              {time ? (
                <TouchableOpacity
                  onPress={() => setShowTimeModal(false)}
                  className="flex-1 rounded-2xl bg-[#C53334] py-3 items-center"
                >
                  <Text className="text-white text-base font-semibold">Valider</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EditReservationForm;
