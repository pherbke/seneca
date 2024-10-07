export const verifierConfig = {
  display: [
    {
      name: "Trust CV",
      location: "Berlin",
      logo: {
        url: `${process.env.SERVER_URL}/_next/image?url=%2Ftrust-cv-logo.png&w=256&q=75`,
        //url: "https://logowik.com/content/uploads/images/technischen-universitat-berlin1469.jpg",
      },
      locale: "en-US",
    },
  ],
  credentials_supported: {
    UniversityDegreeCredential: {
      format: "jwt_vc_json",
      scope: "UniversityDegree",
      cryptographic_binding_methods_supported: ["did:example"],
      credential_signing_alg_values_supported: ["ES256"],
      credential_definition: {
        type: ["VerifiableCredential", "UniversityDegreeCredential"],
        credentialSubject: {
          given_name: {
            display: [
              {
                name: "Given Name",
                locale: "en-US",
              },
            ],
          },
          family_name: {
            display: [
              {
                name: "Surname",
                locale: "en-US",
              },
            ],
          },
          degree: {
            display: [
              {
                name: "Degree Name",
                locale: "en-US",
              },
            ],
          },
          gpa: {
            display: [
              {
                name: "GPA",
              },
            ],
          },
        },
      },
      proof_types_supported: {
        jwt: {
          proof_signing_alg_values_supported: ["ES256"],
        },
      },
      display: [
        {
          name: "University Credential",
          locale: "en-US",
          logo: {
            url: "https://logowik.com/content/uploads/images/technischen-universitat-berlin1469.jpg",
          },
          background_color: "#12107c",
          text_color: "#FFFFFF",
        },
      ],
    },
    LoginCredentials: {
      format: "jwt_vc_json",
      scope: "Login",
      cryptographic_binding_methods_supported: ["did:example"],
      credential_signing_alg_values_supported: ["ES256"],
      credential_definition: {
        type: ["VerifiableCredential", "LoginCredential"],
        credentialSubject: {
          userId: {
            display: [
              {
                name: "userId",
                locale: "en-US",
              },
            ],
          },
          email: {
            display: [
              {
                name: "email",
                locale: "en-US",
              },
            ],
          },
        },
      },
      proof_types_supported: {
        jwt: {
          proof_signing_alg_values_supported: ["ES256"],
        },
      },
      display: [
        {
          name: "Login Credential",
          locale: "en-US",
          logo: {
            url: "https://57a9-149-233-55-5.ngrok-free.app/_next/image?url=%2Ftrust-cv-logo.png&w=384&q=75",
          },
          background_color: "#12107c",
          text_color: "#FFFFFF",
        },
      ],
    },
  },
};
