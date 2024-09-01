import * as jwt from "jsonwebtoken";

export interface JWTPayload {
  type: string;
  organization?: string;
  experience?: string;
  iss: string;
}

export class JWTManager {
  private readonly privateKey: string;
  private readonly issuer: string;

  constructor(privateKey: string, issuer: string) {
    this.privateKey = privateKey;
    this.issuer = issuer;
  }

  encodeJWT(payload: JWTPayload): string {
    return jwt.sign(payload, this.privateKey, { algorithm: "HS256" });
  }

  validateJWT(encodedJWT: string): JWTPayload | null {
    try {
      const decodedPayload = jwt.verify(encodedJWT, this.privateKey, {
        algorithms: ["HS256"],
        issuer: this.issuer,
      }) as JWTPayload;
      return decodedPayload;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }
}
