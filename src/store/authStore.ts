import { create } from "zustand";
import { secureStorage } from "../secureStorage";
import type { AuthUser } from "../types/auth";

const TOKEN_KEY = "coaching_access_token";
const USER_KEY = "coaching_user";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const [token, rawUser] = await Promise.all([
        secureStorage.getItem(TOKEN_KEY),
        secureStorage.getItem(USER_KEY),
      ]);
      const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
      set({ token: user ? token : null, user, hydrated: true });
    } catch {
      set({ token: null, user: null, hydrated: true });
    }
  },
  setSession: async (token, user) => {
    await Promise.all([
      secureStorage.setItem(TOKEN_KEY, token),
      secureStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    set({ token, user, hydrated: true });
  },
  clearSession: async () => {
    await Promise.all([
      secureStorage.removeItem(TOKEN_KEY),
      secureStorage.removeItem(USER_KEY),
    ]);
    set({ token: null, user: null, hydrated: true });
  },
}));
