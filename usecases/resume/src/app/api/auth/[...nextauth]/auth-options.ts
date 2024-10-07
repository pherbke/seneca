import CredentialsProvider from "next-auth/providers/credentials";
import { JWTPayload, SignJWT, importJWK } from "jose";
import prisma from "@/db";
import { Session, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { getUserByEmail } from "@/db/users-db";
import { verifyLoginCredentialJWTSignature } from "@/lib/actions/server-actions";

interface CredentialSubject {
  userId: string;
  email: string;
  id: string;
}

interface Issuer {
  id: string;
}

interface VC {
  "@context": string[];
  id: string;
  type: string[];
  issuer: Issuer;
  issuanceDate: string;
  credentialSubject: CredentialSubject;
  expirationDate: string;
}

interface JWTObject {
  iss: string;
  sub: string;
  vc: VC;
  jti: string;
  exp: number;
  iat: number;
  nbf: number;
}

export interface token extends JWT {
  uid: string;
  jwtToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  role: string;
}

interface DecodedLoginCredentialSubject {
  id: string;
  userId: string;
  email: string;
}

export interface CustomSession extends Session {
  user: User;
}

const generateJWT = async (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET || "secret";

  const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(jwk);

  return jwt;
};

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials-login",
      name: "credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "johndoe",
        },
        email: {
          label: "Email",
          type: "email",
          placeholder: "johndoe@trust-cv.de",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
        login_vp_token: {
          label: "vp_token",
          type: "LoginVC",
          placeholder: "LoginVC",
        },
      },
      async authorize(credentials) {
        if (credentials?.login_vp_token) {
          const decodedVP = await verifyLoginCredentialJWTSignature(
            credentials.login_vp_token,
          );

          if (decodedVP) {
            const user = await getUserByEmail(
              (decodedVP as JWTObject).vc.credentialSubject.email,
            );
            if (
              user &&
              user.id === (decodedVP as JWTObject).vc.credentialSubject.userId
            ) {
              const jwt = await generateJWT({
                id: user.id,
                role: "user",
              });

              return {
                id: user!.id,
                email: user!.email,
                name: `${user!.firstName} ${user!.lastName}`,
                token: jwt,
                role: "user",
              };
            } else {
              return null;
            }
          }
        }

        //Development user
        if (
          (credentials?.username === "johndoe" || credentials?.email) &&
          credentials?.password === "password"
        ) {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials?.email || "johndoe@trust-cv.de",
            },
          });
          if (user) {
            const jwt = await generateJWT({
              id: user.id,
              role: "user",
            });

            return {
              id: user!.id,
              email: user!.email,
              name: `${user!.firstName} ${user!.lastName}`,
              token: jwt,
              role: "user",
            };
          }
        } else if (
          credentials?.username === "tuberlin" &&
          credentials.password === "password"
        ) {
          const user = await prisma.company.findFirst({
            where: {
              email: "info@tu-berlin.de",
            },
          });
          return {
            id: user?.id!,
            email: "info@tu-berlin.de",
            name: user?.name!,
            token: await generateJWT({ id: this.id, role: "company" }),
            role: "company",
          };
        } else if (
          credentials?.username === "fuberlin" &&
          credentials.password === "password"
        ) {
          const user = await prisma.company.findFirst({
            where: {
              email: "info@fu-berlin.de",
            },
          });
          return {
            id: user?.id!,
            email: "info@fu-berlin.de",
            name: user?.name!,
            token: await generateJWT({ id: this.id, role: "company" }),
            role: "company",
          };
        }
        if (credentials?.email && credentials?.password) {
          const user = await getUserByEmail(credentials.email);
          if (user && user.password === credentials.password) {
            const jwt = await generateJWT({
              id: user.id,
              role: "user",
            });

            return {
              id: user!.id,
              email: user!.email,
              name: `${user!.firstName} ${user!.lastName}`,
              token: jwt,
              role: "user",
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      const newToken: token = token as token;

      if (user) {
        newToken.uid = user.id;
        newToken.jwtToken = (user as User).token;
        newToken.role = (user as User).role;
      }
      return newToken;
    },
    session: async ({ session, token }) => {
      const newSession: CustomSession = session as CustomSession;
      if (newSession.user && token.uid) {
        newSession.user.id = token.uid as string;
        newSession.user.token = token.jwtToken as string;
        newSession.user.role = token.role as string;
      }
      return newSession as CustomSession;
    },
  },
  pages: {
    signIn: "/signin",
  },
} satisfies NextAuthOptions;

export default authOptions;
