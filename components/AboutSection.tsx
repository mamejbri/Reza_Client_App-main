import * as React from 'react';
import { useMemo } from 'react';
import { View, Text, Image, ScrollView, Dimensions  } from 'react-native';
import IcoMoonIcon from '../src/icons/IcoMoonIcon';

type OpeningHoursLike = {
  day?: string | { name?: string } | any;

  // lowercase keys
  heureOuvertureMatin?: any;
  heureFermetureMatin?: any;
  heureOuvertureMidi?: any;
  heureFermetureMidi?: any;

  // Uppercase-first (in case your JSON comes like this)
  HeureOuvertureMatin?: any;
  HeureFermetureMatin?: any;
  HeureOuvertureMidi?: any;
  HeureFermetureMidi?: any;
};

interface Props {
  images: string[];
  description: string;
  /** Hours directly from establishment.openingHours (backend DTO). Optional. */
  openingHours?: OpeningHoursLike[] | null;
}

/* ---------- helpers ---------- */

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = Math.min(width * 0.85, 420);
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.58;

const toHmStr = (val: any): string | undefined => {
  if (val == null) return undefined;

  if (typeof val === 'string') {
    const hhmm = val.slice(0, 5);
    const [hh, mm] = hhmm.split(':');
    const h = Number(hh), m = Number(mm);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return undefined;
  }

  if (typeof val === 'object') {
    const h = (val.hour ?? val.H ?? val.h) as number | undefined;
    const m = (val.minute ?? val.M ?? val.m) as number | undefined;
    if (Number.isFinite(h) && Number.isFinite(m)) {
      return `${String(h!).padStart(2, '0')}:${String(m!).padStart(2, '0')}`;
    }
  }

  return undefined;
};

type NormHours = {
  day?: string;
  hmOpen?: string;  // morning open
  hmClose?: string; // morning close
  emOpen?: string;  // evening open (midi)
  emClose?: string; // evening close (midi)
};

const normalizeRow = (row?: OpeningHoursLike | null): NormHours => {
  if (!row) return {};
  // accept both lower- and Uppercase-first keys
  const mo = row.heureOuvertureMatin ?? row.HeureOuvertureMatin;
  const mc = row.heureFermetureMatin ?? row.HeureFermetureMatin;
  const eo = row.heureOuvertureMidi  ?? row.HeureOuvertureMidi;
  const ec = row.heureFermetureMidi  ?? row.HeureFermetureMidi;

  const day =
    typeof row.day === 'string'
      ? row.day
      : row.day?.name ?? String(row.day ?? '');

  return {
    day,
    hmOpen:  toHmStr(mo),
    hmClose: toHmStr(mc),
    emOpen:  toHmStr(eo),
    emClose: toHmStr(ec),
  };
};

const WEEK_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] as const;

const normalizeAll = (arr?: OpeningHoursLike[] | null): NormHours[] => {
  const rows = Array.isArray(arr) ? arr.map(normalizeRow) : [];
  return rows.sort((a, b) => {
    const ia = WEEK_ORDER.indexOf((a.day ?? '').toUpperCase() as any);
    const ib = WEEK_ORDER.indexOf((b.day ?? '').toUpperCase() as any);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
};

const composeRowRanges = (r: NormHours): string | null => {
  const { hmOpen: mo, hmClose: mc, emOpen: eo, emClose: ec } = r;
  const parts: string[] = [];

  // single continuous range
  if (mo && ec && !mc && !eo) return `${mo}–${ec}`;

  if (mo && mc) parts.push(`${mo}–${mc}`);
  if (eo && ec) parts.push(`${eo}–${ec}`);

  if (parts.length === 0) {
    const start = mo || eo;
    const end   = ec || mc;
    if (start && end) return `${start}–${end}`;
    return null;
  }
  return parts.join(', ');
};

const DAY_LABEL = (d?: string) => {
  const up = (d ?? '').toUpperCase();
  switch (up) {
    case 'MONDAY': return 'Lundi';
    case 'TUESDAY': return 'Mardi';
    case 'WEDNESDAY': return 'Mercredi';
    case 'THURSDAY': return 'Jeudi';
    case 'FRIDAY': return 'Vendredi';
    case 'SATURDAY': return 'Samedi';
    case 'SUNDAY': return 'Dimanche';
    default: return d ?? '';
  }
};

/* ---------------- component ---------------- */

const AboutSection: React.FC<Props> = ({ images, description, openingHours }) => {
  const hours = useMemo(() => normalizeAll(openingHours), [openingHours]);

  return (
    <View className="pb-6 px-4">
      {/* Gallery */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-9">
        {images.map((img) => (
          <Image
            key={img}
            source={{ uri: img }}
            style={{
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
              borderRadius: 16,
              marginRight: 16,
            }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <Text className="text-lg font-semibold pl-1 mb-3">À propos de nous</Text>

      {/* Horaires */}
      <View className="rounded-2xl bg-gray-100 px-3 py-3 bg-white mb-6">
        <View className="flex-row justify-between items-start flex-wrap">
          <IcoMoonIcon name="time" size={18} color="#C53334" />
          <Text className="ml-2 font-semibold text-[14px]">Horaires</Text>
        </View>

        {hours.length > 0 ? (
          <View className="gap-2">
            {hours.map((row, idx) => {
              const label = composeRowRanges(row);
              return (
                <View key={`oh-${idx}`} className="flex-row justify-between">
                  <Text className="text-[12px] font-bold text-gray-800 flex-shrink">
                    {DAY_LABEL(row.day)}
                  </Text>

                  <Text className="text-[12px] font-bold text-right ml-2">
                    {label ?? 'Fermé'}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text className="text-[12px] text-gray-500">Horaires non renseignés.</Text>
        )}
      </View>

      {/* About */}
     {description?.length > 0 ? (
      <Text
          className="text-base text-center text-gray-800 px-3 mb-6"
          style={{ lineHeight: 22 }}
        >
        {description}
      </Text>
    ) : (
      <Text
          className="text-sm text-gray-500 text-center bg-[#F3F4F6] rounded-xl px-3 py-3 mb-6"
          style={{ lineHeight: 20 }}
        >
        Description non renseignée.
      </Text>
)}
    </View>
  );
};

export default AboutSection;
