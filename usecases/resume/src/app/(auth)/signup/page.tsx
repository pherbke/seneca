import React from "react";
import SignUp from "./signup";
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
      <SignUp />
    </div>
  );
};

export default SignInPage;
