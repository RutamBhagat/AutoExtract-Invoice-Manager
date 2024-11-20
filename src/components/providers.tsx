"use client";
import { Toaster } from "@/components/ui/sonner";
import ZustandProviders from "./zustand-providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
     <QueryClientProvider client={queryClient}>
      <ZustandProviders>
        {children}
        <Toaster />
      </ZustandProviders>
     </QueryClientProvider>
  );
}
