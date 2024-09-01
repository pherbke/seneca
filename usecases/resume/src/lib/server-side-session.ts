"use server";

import authOptions from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from "next-auth";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id || "";

  return { session, userId };
});
