import type { Metadata } from "next";
import { Inter } from "next/font/google";
import App from "@/components/app";
import { FC, PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";
import Auth from "@/components/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustCV",
  description: "Instant, Secure Resume Credential Verification",
};

type RootLayoutProps = PropsWithChildren;

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <App>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
