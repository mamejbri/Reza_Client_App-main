// components/ReviewSection.tsx
import React from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import IcoMoonIcon from '../src/icons/IcoMoonIcon';

/** Raw review shape from API (flexible on client fields) */
type RawReview = {
  id: number;
  rating: number;
  contenu?: string | null;
  createdDate?: string | null;

  // any of these may exist depending on your backend mapping:
  clientName?: string | null;
  clientLastName?: string | null;
  clientFirstName?: string | null;

  firstName?: string | null;
  lastName?: string | null;
  prenom?: string | null;
  nom?: string | null;

  clientEmail?: string | null;
  clientAvatarUrl?: string | null;

  client?: {
    firstName?: string | null;
    lastName?: string | null;
    prenom?: string | null;
    nom?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    photoUrl?: string | null;
  } | null;
};

type Props = {
  loading?: boolean;
  average?: number;
  count?: number;
  reviews?: RawReview[];
};

/** Normalize names/avatars from many possible backend field names */
const getClientMeta = (r: RawReview) => {
  const first =
    r.clientFirstName ??
    r.firstName ??
    r.prenom ??
    r.client?.firstName ??
    r.client?.prenom ??
    r.clientName ??
    null;

  const last =
    r.clientLastName ??
    r.lastName ??
    r.nom ??
    r.client?.lastName ??
    r.client?.nom ??
    null;

  const email = r.clientEmail ?? r.client?.email ?? null;

  const avatar =
  r.clientAvatarUrl ??
  (r as any).photoUrl ??   
  r.client?.avatarUrl ??
  r.client?.photoUrl ??
  null;

  const displayName =
    [first, last].filter(Boolean).join(' ').trim() ||
    first ||
    last ||
    (email ?? 'Utilisateur');

  const initials = (first?.[0] ?? '') + (last?.[0] ?? '');
  return { displayName, initials: initials.toUpperCase() || 'U', avatar };
};

const StarRow = ({ rating }: { rating: number }) => (
  <View className="flex-row items-center">
    {[1, 2, 3, 4, 5].map((i) => (
      <IcoMoonIcon
        key={i}
        name={i <= (rating ?? 0) ? 'star-solid' : 'star'}
        size={16}
        color={i <= (rating ?? 0) ? '#C53334' : '#C9C9C9'} // red like your UI
      />
    ))}
  </View>
);

/** Single review card styled like the mock */
const ReviewCard: React.FC<{ r: RawReview }> = ({ r }) => {
  const { displayName, initials, avatar } = getClientMeta(r);
  const text = (r.contenu ?? '').trim();

  return (
    <View className="bg-[#F3F4F6] rounded-2xl p-3 mb-4">
      {/* Header: avatar + name + stars */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }}
            />
          ) : (
            <View
              style={{ width: 36, height: 36, borderRadius: 18 }}
              className="bg-gray-300 mr-2 items-center justify-center"
            >
              <Text className="text-[12px] font-bold text-gray-700">{initials}</Text>
            </View>
          )}
          <Text className="text-[15px] font-semibold">{displayName}</Text>
        </View>

        {/* Stars (red) */}
        <StarRow rating={r.rating ?? 0} />
      </View>

      {/* Quoted/italic content */}
      {!!text && (
        <View className="bg-white rounded-xl px-3 py-3">
          <Text className="text-[14px] text-gray-800 italic">
            “{text}”
          </Text>
        </View>
      )}
    </View>
  );
};

const ReviewSection: React.FC<Props> = ({ loading, average, count, reviews }) => {
  if (loading) {
    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#C53334" />
      </View>
    );
  }

  const items = Array.isArray(reviews) ? reviews : [];

  return (
    <View>
      {/* Summary row */}
      <View className="flex-row items-center gap-2 mb-3">
        {typeof average === 'number' && typeof count === 'number' ? (
          <>
            <IcoMoonIcon name="star" size={20} color="#C53334" />
            <Text className="text-base font-semibold">{average.toFixed(1)}</Text>
            <Text className="text-base text-gray-600">• {count} avis</Text>
          </>
        ) : (
          <Text className="text-base text-gray-600">Aucun avis</Text>
        )}
      </View>

      {/* List */}
      {items.length === 0 ? (
        <Text className="text-sm text-gray-500">Pas encore d’avis.</Text>
      ) : (
        <View>{items.map((r) => <ReviewCard key={r.id} r={r} />)}</View>
      )}
    </View>
  );
};

export default ReviewSection;
