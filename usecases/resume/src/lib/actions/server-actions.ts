"use server";

import { createUser, getUserByEmail } from "@/db/users-db";
import { User } from "@prisma/client";
import axios from "axios";
import jwt from "jsonwebtoken";
import fs from "fs";
import { v4 as uuid } from "uuid";
import {
  getJobApplicationsById,
  updateJobApplication,
} from "@/db/job-applications";
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
  const credentialSubject = {
    userId: userData.id,
    email: userData.email,
  };
  console.log(credentialSubject);
  const response = await axios({
    method: "post",
    url: process.env.EXTERNAL_ISSUER_URL,
    data: { credentialSubject, type: ["LoginCredential"] },
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
  companyName: string,
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
        message: `${companyName} wants you to verifiy your claims`,
        timestamp: new Date().toUTCString(),
        applicationId: applicationId,
        pd: { ...presentationDefinition },
      },
    });
    return res;
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
export const handleRequestVC = async (
  applicationId: string,
  pdOptions: string[],
  companyName: string,
): Promise<boolean> => {
  //TODO: make it use the pdOption to select the pd dynamically
  console.log(pdOptions);

  const pd = {
    id: "d49ee616-0e8d-4698-aff5-2a8a2362652d",
    name: "UniversityDegreeCredential",
    format: {
      jwt_vc: {
        alg: ["ES256", "ES384"],
      },
    },
    input_descriptors: [
      {
        id: "abd4acb1-1dcb-41ad-8596-ceb1401a69c7",
        format: {
          jwt_vc: {
            alg: ["ES256", "ES384"],
          },
        },
        constraints: {
          fields: [
            {
              path: [
                "$.credentialSubject.given_name",
                "$.vc.credentialSubject.given_name",
              ],
            },
            {
              path: [
                "$.credentialSubject.family_name",
                "$.vc.credentialSubject.family_name",
              ],
            },
            {
              path: ["$.credentialSubject.gpa", "$.vc.credentialSubject.gpa"],
            },
            {
              path: [
                "$.credentialSubject.degree",
                "$.vc.credentialSubject.degree",
              ],
            },
          ],
        },
        limit_disclosure: "required",
      },
    ],
  };

  try {
    const res = await sendVCRequest(applicationId, pd, companyName);
    if (res) {
      await updateJobApplication(
        applicationId,
        undefined,
        undefined,
        undefined,
        "VP Rquested",
      );
      return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
  return false;
};
