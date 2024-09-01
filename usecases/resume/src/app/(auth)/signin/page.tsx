import React from "react";
import SignIn from "./signin";
import { getCurrentUser } from "@/lib/server-side-session";
import { redirect } from "next/navigation";

const SignInPage = async ({
  searchParams,
}: {
  searchParams: { callbackUrl: string };
}) => {
  const { session } = await getCurrentUser();
  console.log("Session: ", session);
  if (session?.user) {
    const callbackUrl = searchParams.callbackUrl ?? `/`;
    redirect(callbackUrl);
  }
  return (
    <div>
      <SignIn />
    </div>
  );
};

export default SignInPage;
