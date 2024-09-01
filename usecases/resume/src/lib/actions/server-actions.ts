"use server";

import { createUser, getUserByEmail } from "@/db/users-db";
import { User } from "@prisma/client";
import axios from "axios";
import { jwk } from "../certs/issuer-jwk";
import jwt from "jsonwebtoken";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { getJobApplicationsById } from "@/db/job-applications";
import { getCurrentUser } from "../server-side-session";
import { importJWK, jwtVerify } from "jose";

type SignUpData = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export async function signUp({
  email,
  firstName,
  lastName,
  password,
}: SignUpData) {
  const user = await getUserByEmail(email);
  if (user?.id) {
    console.log("User already exists");
    return;
  }
  return await createUser(firstName, lastName, email, password);
}

export async function generateLoginVC(userData: Omit<User, "password">) {
  const credentialData = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
    ],
    id: "http://example.gov/credentials/3732",
    type: ["VerifiableCredential", "LoginCredential"],
    issuer: {
      id: process.env.SERVER_URL,
    },
    issuanceDate: new Date(),
    credentialSubject: {
      userId: userData.id,
      email: userData.email,
    },
  };

  const requestBody = {
    issuerKey: {
      type: "jwk",
      jwk: jwk,
    },
    issuerDid: process.env.ISSUER_DID,
    credentialConfigurationId: "TrusCV_login_jwt_vc",
    credentialData: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1",
      ],
      id: "http://example.gov/credentials/3732",
      type: ["VerifiableCredential", "LoginCredential"],
      issuer: {
        id: "did:web:vc.transmute.world",
      },
      issuanceDate: new Date(),
      credentialSubject: {
        userId: userData.id,
        email: userData.email,
      },
    },
    mapping: {
      id: "<uuid>",
      issuer: {
        id: "<issuerDid>",
      },
      credentialSubject: {
        id: "<subjectDid>",
      },
      issuanceDate: "<timestamp>",
      expirationDate: "<timestamp-in:365d>",
    },
  };

  const response = await axios({
    method: "post",
    url: process.env.EXTERNAL_ISSUER_URL,
    data: requestBody,
  });

  if (response.status === 200) {
    return response.data;
  }
  return;
}

export async function verifyLoginCredentialJWTSignature(vp_token: string) {
  try {
    const publicKeyPem = fs.readFileSync(
      `${process.env.ROOT_PATH}/src/lib/certs/public-key-for-login-verification.pem`,
      "utf-8",
    );

    return jwt.verify(vp_token, publicKeyPem, { algorithms: ["ES256"] });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log(error);
      return null;
    } else {
      console.error("An unexpected error occurred:", error);
    }
    throw error;
  }
}

export async function verifyToken(jwk: any, token: any) {
  try {
    const publicKey = await importJWK(jwk, "ES256");

    const { payload, protectedHeader } = await jwtVerify(token, publicKey);

    console.log("JWT verified successfully:", payload);
    console.log("Protected header:", protectedHeader);
    return true;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return false;
  }
}



export async function sendVCRequest(
  applicationId: string,
  presentationDefinition: any,
) {
  try {
    const data = await getJobApplicationsById(applicationId);
    const currentUser = await getCurrentUser();
    const res = await axios.post(process.env.REDIS_URL + "/publish", {
      topic: data?.userId,
      message: {
        type: "vpRequest",
        userId: currentUser.userId,
        id: uuid(),
        read: false,
        title: "Verifiable Presentation Request",
        message: "TU Berlin wants you to verifiy your claims",
        timestamp: new Date(),
        applicationId: applicationId,
        pd: { ...presentationDefinition },
      },
    });
  } catch (error) {
    console.log("Error sending vc request: ", error);
    return false;
  }
}


export async function createPubSubTopicAndSubscribe(userId: string) {
  try {
    const topicExists = (
      await axios.get(process.env.REDIS_URL + "/topic/" + userId)
    ).data;

    if (topicExists.exists === false) {
      const res = await axios.post(process.env.REDIS_URL + "/topic", {
        topic: userId,
      });
      if (res.status === 201) {
        await axios.post(process.env.REDIS_URL + "/subscribe", {
          topic: userId,
        });
      }
    }
  } catch (error) {
    console.error("Error creating pub/sub topic: ", error);
  }
}
