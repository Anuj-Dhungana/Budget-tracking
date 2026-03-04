import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuthenticatedUserEmail() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null
  );
}
