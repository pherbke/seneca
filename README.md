![Seneca Logo](seneca.png)
# Seneca: Secure ENvironment for Encrypted Credential Assurance


Seneca is a research-driven project aimed at developing a decentralized credential lifecycle management system using advanced cryptographic techniques. The project focuses on two primary components: Threshold Signature Schemes (TSS) for decentralized credential issuance and Zero-Knowledge Proofs (ZKP) for privacy-preserving verification of credentials. This work is part of ongoing PhD research exploring secure and decentralized methods for managing digital credentials.

## Overview

The Seneca project integrates the following core components:

### Threshold Signature Schemes (TSS)
Seneca employs Threshold Signature Schemes to decentralize the credential issuance process. TSS allows a distributed group of issuers to collaboratively sign credentials without any single issuer holding complete control. This approach enhances the security and trustworthiness of the credentialing system by eliminating single points of failure. Additionally, a consortium of issuers maintains the status of verifiable credentials in real-time. The status of credentials is stored on decentralized data structures such as IPFS.

### Zero-Knowledge Proofs (ZKP)
Zero-Knowledge Proofs are utilized in Seneca to enable the privacy-preserving verification of credentials. With ZKP, users can prove the validity of their credentials without revealing any additional information, ensuring that personal data remains secure during the verification process. This component is crucial for maintaining user anonymity while still providing verifiable claims.

## Key Features

- **Decentralized Issuance**: Utilizing TSS to ensure that credentials are issued through a collaborative process involving multiple issuers.
- **Real-Time Status Maintenance**: A consortium of issuers maintains the status of verifiable credentials in real-time, stored on decentralized data structures such as IPFS.
- **Privacy-Preserving Verification**: Leveraging ZKP to allow for anonymous verification of claims, protecting user privacy.
- **Scalable Infrastructure**: Designed to be scalable and applicable across various credentialing scenarios and industries.

## Getting Started

### Prerequisites
- Node.js and npm (for running the JavaScript components)
- Python (for any auxiliary scripts)
- Git (for cloning and managing the repository)
- Docker (for running the Dockerized components)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/seneca.git
    cd seneca
    ```

2. Install dependencies:
    ```bash
    yarn install
    ```

### Usage

The project is structured into multiple modules, each containing specific components. The main modules are as follows:

- `issuer`: Contains the implementation for credential issuance.
  - `centralized`: Contains the implementation for centralized credential issuance.
  - `decentralized`: Contains the Threshold Signature Scheme implementation with a consortium-driven issuer setup for issuing verifiable credentials.
- `verifier/zkp`: Contains the Zero-Knowledge Proof implementation for privacy-preserving verification.
- `api`: Contains the API server to interact with the different components.
- `client`: Contains the client-side application for users to manage their credentials.
- `use_case`: Contains specific use case implementations and examples demonstrating how to use the Seneca system for various scenarios.
  - `resume`: Contains the implementation for verifiable resume credentials.
  - `studentid`: Contains the implementation for student ID verifiable credentials for student cards.

To run the project, follow these steps:

1. Start the API server:
    ```bash
    cd api
    yarn start
    ```

2. Start the client application:
    ```bash
    cd client
    yarn start
    ```

## Contributing

We welcome contributions to the Seneca project. Please see the `CONTRIBUTING.md` file for more details on how to get started.

## License

This project is licensed under the Apache License 2.0 - see the `LICENSE` file for details.