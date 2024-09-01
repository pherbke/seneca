const { generateKeyPair } = require("crypto");
const fs = require("fs");

/*
    You can use this script to generate private and public key for signing the request tokens.
*/

generateKeyPair(
  "ec",
  {
    namedCurve: "prime256v1",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  },
  (err, publicKey, privateKey) => {
    if (err) {
      console.error("Error generating key pair:", err);
      return;
    }

    fs.writeFile("public.pem", publicKey, (err) => {
      if (err) {
        console.error("Error writing public key to file:", err);
        return;
      }
      console.log("Public key saved to public_key.pem");
    });

    fs.writeFile("private.pem", privateKey, (err) => {
      if (err) {
        console.error("Error writing private key to file:", err);
        return;
      }
      console.log("Private key saved to private_key.pem");
    });
  },
);
