import ZustandProviders from "./zustand-providers";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ZustandProviders>{children}</ZustandProviders>;
}
