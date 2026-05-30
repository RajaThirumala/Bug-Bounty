import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/features/auth";
import { useSupabaseRealtimeInvalidation } from "@/features/realtime/useSupabaseRealtimeInvalidation";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const initTheme = useThemeStore((s) => s.initTheme);
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initTheme();
    void initAuth();
  }, [initAuth, initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeInvalidator />
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

function RealtimeInvalidator() {
  useSupabaseRealtimeInvalidation();
  return null;
}
