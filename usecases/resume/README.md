# Credential Issuer and Verifier

This project provides a comprehensive set of tools for issuing and verifying digital credentials, such as university degrees, job certificates, and more. It includes a user-friendly web application, an issuer server, and a verifier server, all built using modern web technologies.

## Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Starting the Issuer and Getting a Demo University Credential](#starting-the-issuer-and-getting-a-demo-university-credential)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Ensure that Docker is installed and running on your machine.

### Installation and Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

   **Note for Windows users:**  
   Navigate into the `redis-pub-sub` and `websocket-server` folders and run `npm install` in each.

2. **Set up the database and Redis:**

   ```bash
   docker compose up
   ```

3. **Create an `.env` file:**

   Create an `.env` file in the root folder and add the environment variables listed in the `.env.example` file.

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Run the WebSocket server:**

   ```bash
   npm run ws
   # or
   yarn ws
   ```

6. **Run the pub-sub server:**

   ```bash
   npm run redis
   # or
   yarn redis
   ```

   This will create a database schema and run the application along with the WebSocket server.

7. **Populate the database with test data:**

   **Note:** Ensure the server is running before seeding the database.

   ```bash
   npm run seed-db
   ```

8. **Access the application:**

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

9. **Login with the following credentials:**

   - **Username:** `johndoe` / `tuberlin` / `max@trust-cv.de`
   - **Password:** `password`

## Starting the Issuer and Getting a Demo University Credential

The Issuer consists of two primary files: `authServer.js` and `issuer.js`. These files manage the authentication server and the issuer server, respectively. The `authServer.js` runs on port `7001`, while the `issuer.js` runs on port `7002`. Both servers need to be exposed to the internet to communicate with external wallets or holders.

### Prerequisites

Before starting, ensure you have the following installed:

1. **ngrok:**  
   Download and install ngrok from the [official website](https://ngrok.com/), and get your API key.

### Installation and Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up ngrok:**

   Use the `ngrok.yaml` config file to get started:

   ```bash
   ngrok --config ngrok.yaml start --all
   ```

   This will expose your localhost to the internet.

3. **Configure environment variables:**

   - Copy the ngrok URLs to the `AUTHSERVER_URL` and `SERVER_URL` variables in the `.env` file (refer to `.env.example` for guidance).
   - Replace the `SERVER_URL` in the `.env` file of the resume use case as well.

4. **Run the Issuer and Authentication Server:**

   ```bash
   node issuer.js
   node authServer.js
   ```

5. **Get your demo credentials:**

   Send a POST request to:

   ```bash
   http://localhost:7002/offer
   ```

   - Copy the response URL (`open-credential-offer://...`) to a QR code generator (e.g., [QRCode Generator](https://www.qrcode-generator.de)).

   - Scan the QR code with your wallet app, such as [iGrant.io DataWallet](https://igrant.io/datawallet.html).

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request.

## License

This project is licensed under the Apache 2.0 License.
