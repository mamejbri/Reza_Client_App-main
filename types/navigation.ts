// src/types/navigation.ts
import type { EstablishmentType } from './establishment';
import type { EtablissementDTO } from '../services/etablissements';

export type RootStackScreenName =
  | 'Home'
  | 'Booking'
  | 'SearchResults'
  | 'Login'
  | 'Signup'
  | 'ForgotPassword'
  | 'Appointments'
  | 'ReservationDetail'
  | 'EstablishmentBooking';


export type RootStackParamList = {
  Home: undefined;

  // Search hero
  Booking: {
    background: any;
    type: EstablishmentType;
  };

  // Results
  SearchResults: {
    query?: string | null;
    coords?: { lat: number; lng: number } | null;
    type: EstablishmentType;
  };

  // Auth
Login: {
  redirectAfterLogin?: {
    screen: keyof RootStackParamList;
    params?: any;
  };
};  

Signup: {
    redirectAfterLogin?: {
    screen: RootStackScreenName;
      params?: any;
    };
  };
    ForgotPassword: undefined; // 🔹 utilisé par Login & ForgotPasswordScreen

  // User area
  Appointments: { type?: EstablishmentType } | undefined;

  // Reservation detail
  ReservationDetail: {
    reservation: any;
    isPast?: boolean;
    startInEditMode?: boolean;
  };

  // Booking flow for a specific establishment
  EstablishmentBooking: {
    establishment: EtablissementDTO
    initialPeople?: number;
    initialDateISO: string; // YYYY-MM-DD
    initialTime: string;
    availableSlots: Record<
      string,
      { time: string; reserved_by: string | null }[]
    >;
    initialProgramId?: string;
  };
};
