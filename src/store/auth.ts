// src/store/auth.ts
import { create } from 'zustand';

type AuthState = {
  user: any | null;
  setUser: (u: any | null) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
