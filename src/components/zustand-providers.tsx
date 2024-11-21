import { CounterStoreProvider } from "@/providers/counter-store-provider";
import { FileStoreProvider } from "@/providers/file-store-provider";

export default function ZustandProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CounterStoreProvider>
      <FileStoreProvider>{children}</FileStoreProvider>
    </CounterStoreProvider>
  );
}
