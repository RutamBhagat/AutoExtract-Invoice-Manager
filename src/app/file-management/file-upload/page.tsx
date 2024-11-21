import { HydrateClient, api } from "@/trpc/server";

import FileUploadDemo from "@/components/file-upload-demo";
import { auth } from "@/server/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <FileUploadDemo />
    </HydrateClient>
  );
}
