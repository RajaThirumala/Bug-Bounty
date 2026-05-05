import { create } from "zustand";
import type { AuthUser } from "@/features/auth/types";

export const mockAuthUsers: AuthUser[] = [
  {
    id: "user-jane-developer",
    name: "Jane Developer",
    email: "developer@bugbounty.test",
    handle: "@jane",
    role: "developer",
    title: "Security developer",
    initials: "JD",
  },
  {
    id: "org-acme-user",
    name: "Alex Morgan",
    email: "organization@bugbounty.test",
    handle: "@acme",
    role: "organization",
    title: "Acme security lead",
    initials: "AM",
  },
];

export const mockPassword = "password123";

const defaultUser = mockAuthUsers[0];

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  setRole: (role: AuthUser["role"]) => void;
}

// TODO: Replace this mock store with backend auth when the API is ready.
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: defaultUser,
  signIn: (email, password) => {
    const user = mockAuthUsers.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (!user || password !== mockPassword) {
      return false;
    }

    set({ isAuthenticated: true, user });
    return true;
  },
  signOut: () => set({ isAuthenticated: false }),
  setRole: (role) =>
    set({
      user: mockAuthUsers.find((user) => user.role === role) ?? defaultUser,
    }),
}));
