import { CounterStoreProvider } from "@/providers/counter-store-provider";

export default function ZustandProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <CounterStoreProvider>{children}</CounterStoreProvider>;
}
