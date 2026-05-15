import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { apiRequest } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { AuthUser, BackendRole, UserRole } from "@/features/auth/types";

type BackendAuthUser = {
  id: string;
  email: string;
  fullName: string;
  username: string | null;
  role: BackendRole;
  onboardingCompleted: boolean;
};

type AuthResponse = {
  session: Session | null;
  user: BackendAuthUser;
};

const OAUTH_ROLE_KEY = "bug-bounty.oauthRole";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  initAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<AuthUser>;
  signInWithOAuth: (provider: "google" | "github", role?: UserRole) => Promise<void>;
  completeOAuthSignIn: () => Promise<AuthUser>;
  chooseResearcher: () => Promise<AuthUser>;
  createOrganization: (name: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const roleToBackend = (role: UserRole): BackendRole =>
  role === "organization" ? "organization_owner" : "researcher";

const roleFromBackend = (role: BackendRole): UserRole =>
  role === "organization_owner" || role === "organization_member" || role === "triager"
    ? "organization"
    : "developer";

const toAuthUser = (user: BackendAuthUser): AuthUser => {
  const name = user.fullName || user.email;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const role = roleFromBackend(user.role);

  return {
    id: user.id,
    name,
    email: user.email,
    handle: user.username ? `@${user.username}` : null,
    role,
    backendRole: user.role,
    onboardingCompleted: user.onboardingCompleted,
    title: user.role === "organization_owner" ? "Organization owner" : role === "organization" ? "Organization member" : "Security researcher",
    initials: initials || "U",
  };
};

const fetchMe = async (accessToken: string) => {
  const response = await apiRequest<{ user: BackendAuthUser }>("/api/auth/me", {
    accessToken,
  });

  return toAuthUser(response.user);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  user: null,
  initAuth: async () => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token ?? null;

    if (!accessToken) {
      set({ isAuthenticated: false, isLoading: false, accessToken: null, user: null });
      return;
    }

    const user = await fetchMe(accessToken);
    set({ isAuthenticated: true, isLoading: false, accessToken, user });
  },
  signIn: async (email, password) => {
    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.session) {
      await supabase.auth.setSession({
        access_token: response.session.access_token,
        refresh_token: response.session.refresh_token,
      });
    }

    const user = toAuthUser(response.user);
    set({
      isAuthenticated: true,
      isLoading: false,
      accessToken: response.session?.access_token ?? null,
      user,
    });
    return user;
  },
  register: async ({ name, email, password, role }) => {
    const response = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role: roleToBackend(role),
      }),
    });

    if (response.session) {
      await supabase.auth.setSession({
        access_token: response.session.access_token,
        refresh_token: response.session.refresh_token,
      });
    }

    const user = toAuthUser(response.user);
    set({
      isAuthenticated: Boolean(response.session),
      isLoading: false,
      accessToken: response.session?.access_token ?? null,
      user,
    });
    return user;
  },
  signInWithOAuth: async (provider, role) => {
    if (role) {
      window.localStorage.setItem(OAUTH_ROLE_KEY, roleToBackend(role));
    } else {
      window.localStorage.removeItem(OAUTH_ROLE_KEY);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      window.localStorage.removeItem(OAUTH_ROLE_KEY);
      throw new Error(error.message);
    }
  },
  completeOAuthSignIn: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      throw new Error(error?.message ?? "OAuth session was not created");
    }

    const oauthRole = window.localStorage.getItem(OAUTH_ROLE_KEY);
    window.localStorage.removeItem(OAUTH_ROLE_KEY);

    const response = await apiRequest<{ user: BackendAuthUser }>("/api/auth/oauth/complete", {
      method: "POST",
      accessToken: data.session.access_token,
      body: JSON.stringify(oauthRole ? { role: oauthRole } : {}),
    });
    const user = toAuthUser(response.user);

    set({
      isAuthenticated: true,
      isLoading: false,
      accessToken: data.session.access_token,
      user,
    });
    return user;
  },
  chooseResearcher: async () => {
    const accessToken = get().accessToken;
    if (!accessToken) {
      throw new Error("Authentication required");
    }

    const response = await apiRequest<{ user: BackendAuthUser }>("/api/auth/onboarding/researcher", {
      method: "POST",
      accessToken,
      body: JSON.stringify({}),
    });

    const user = toAuthUser(response.user);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },
  createOrganization: async (name) => {
    const accessToken = get().accessToken;
    if (!accessToken) {
      throw new Error("Authentication required");
    }

    const response = await apiRequest<{ user: BackendAuthUser }>("/api/auth/onboarding/organization", {
      method: "POST",
      accessToken,
      body: JSON.stringify({ name }),
    });

    const user = toAuthUser(response.user);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, isLoading: false, accessToken: null, user: null });
  },
  setRole: (role) => {
    const user = get().user;
    if (!user) {
      return;
    }

    set({
      user: {
        ...user,
        role,
        backendRole: roleToBackend(role),
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  },
}));
