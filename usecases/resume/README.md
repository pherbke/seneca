## Prerequisite

Please make sure that docker is already installed in your machine and is running.

## Getting Started

1. Install dependencies

```bash
npm install
```
Note: For Windows users: move into folder `redis-pub-sub` and `websocket-server` and run `npm install`

2. Create .env file in your root folder and add the Environment Variables listed in .env.example file

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```
3. Run the websocket server:

```bash
npm run ws
# or
yarn ws
```

3. Run the pub-sub server:

```bash
npm run redis
# or
yarn redis
```

It will create a db schema and run the application, along with websocket server.

4. Populate db with test data ( Note: the server has to be running to seed db)
```
npm run seed-db
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

6. Login:
   username: johndoe / tuberlin / max@trust-cv.de
   password: password