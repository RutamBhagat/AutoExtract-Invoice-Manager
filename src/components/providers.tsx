import { Toaster } from "@/components/ui/sonner";
import ZustandProviders from "./zustand-providers";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ZustandProviders>
      {children}
      <Toaster />
    </ZustandProviders>
  );
}
