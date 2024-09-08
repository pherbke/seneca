![Seneca Logo](assets/seneca.png)
# Seneca: Secure ENvironment for Encrypted Credential Assurance

Seneca is a research-driven project aimed at developing a decentralized credential lifecycle management system using advanced cryptographic techniques. The project focuses on two primary components: Threshold Signature Schemes (TSS) for decentralized credential issuance and Zero-Knowledge Proofs (ZKP) for privacy-preserving verification of credentials. This work is part of ongoing PhD research exploring secure and decentralized methods for managing digital credentials.

## Philosophy

"It is not because things are difficult that we do not dare; it is because we do not dare that things are difficult."  
— *Seneca, Epistulae Morales ad Lucilium*, Letter 104

At the core of our project lies the Stoic principle embodied in Seneca's quote. The challenges we face are not insurmountable, but rather, our courage and initiative determine our success. This philosophy drives our commitment to tackling complex problems and pushing the boundaries of what is possible.

## Overview

Seneca is a research project focused on advancing cryptographic techniques to overcome single points of failure typically found in traditional systems reliant on centralized certificate authorities. Seneca aims to provide a more resilient and decentralized approach to credential lifecycle management by distributing trust among a consortium. Through threshold signature schemes (TSS), Seneca enables consortium-driven issuance, revocation, and suspension of verifiable credentials. Credential issuance is handled via partial signatures from multiple entities, ensuring no single party has complete control. Importantly, information related to the credentials is only accessible to the designated issuer, enhancing security and privacy.

Seneca employs zero-knowledge proofs (ZKP) to verify credentials in a privacy-preserving manner. Zero-knowledge proofs allow credential holders to prove the validity of their credentials without exposing sensitive personal information, ensuring a secure and confidential verification process. By combining threshold signatures and zero-knowledge proofs, Seneca provides a robust, privacy-focused solution for decentralized, secure management of verifiable credentials across various use cases.

Seneca supports verifiable credentials across various use cases, including identity verification, academic qualifications, and professional certifications.
### Key Components

The key components of seneca are as follows:

#### Threshold Signature Schemes (TSS)
Seneca employs TSS to decentralize the credential issuance process. TSS allows a distributed group of issuers to collaboratively sign credentials without any single issuer holding complete control. This approach enhances the security and trustworthiness of the credentialing system by eliminating single points of failure. Additionally, a consortium of issuers maintains the status of verifiable credentials in real-time. The status of credentials is stored on decentralized data structures such as IPFS.

#### Zero-Knowledge Proofs (ZKP)
ZKPs are utilized in Seneca to enable the privacy-preserving verification of credentials. With ZKP, users can prove the validity of their credentials without revealing any additional information, ensuring that personal data remains secure during the verification process. This component is crucial for maintaining user anonymity while still providing verifiable claims.

## Key Features

- **Decentralized Issuance**: Utilizing TSS to ensure that credentials are issued through a collaborative process involving multiple issuers.
- **Real-Time Status Maintenance**: A consortium of issuers maintains the status of verifiable credentials in real-time, stored on decentralized data structures such as IPFS. Status of credentials can be valid, revoked, suspended, unsuspended.
- **Privacy-Preserving Verification**: Leveraging ZKP to allow for anonymous verification of claims, protecting user privacy.
- **Scalable Infrastructure**: Seneca is designed to be scalable and applicable across various domains and credentialing scenarios.

## Getting Started

### Prerequisites
- Node.js and npm (for running the JavaScript components)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/seneca.git
    cd seneca
    ```
   
#### Use Case Installation
Currently, the project supports the following use cases:

- Resumé credential use case:
    ```bash
    cd usecases/resume
    ```
Requirements and intallation instructions are in the README.md file in the respective use case directory.

### Content

The project is structured into multiple modules, each containing specific components. The main modules are as follows:

- `assets`: Contains images and other assets used in the project.
- `broadcasting`: Contains the implementation for broadcasting messages across the network. (WIP)
- `holder`: Contains the wallet implementation for credential management by iOS and android users.
  - `iOS`: Contains the iOS implementation for the wallet.
  - `android`: Contains the Android implementation for the wallet.
- `issuer`: Contains the implementation for credential issuance.
    - `decentralized`: Contains the decentralized issuer implementation.
    - `centralized`: Contains the centralized issuer implementation.
- `storage`: Contains the implementation for decentralized storage (of credential status).
- `usecases`: Contains use case implementations and examples demonstrating how to use the Seneca system for various scenarios.
  - `resume`: Contains the implementation for verifiable resume credentials.
  - `studentid`: Contains the implementation for student ID verifiable credentials for student cards.
- `verifier/zkp`: Contains the Zero-Knowledge Proof implementation for privacy-preserving verification.

## Use Case Demos
### Resumé Credentials
  <details>
    <summary>Click to see the Resume Credentials Demo</summary>

![Resume Demo](./assets/resume.gif)
  </details>

## Contributing

We welcome contributions to the Seneca project. Please see the `CONTRIBUTING.md` file for more details on how to get started.

## License

This project is licensed under the Apache License 2.0 - see the `LICENSE` file for details.