import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const httpServer = app.listen(8080, () => {
  console.log(
    "\n ************************ WS Server is listening on port 8080 ******************************** \n",
  );
});

const wss = new WebSocketServer({ server: httpServer });
const clients = new Map();

wss.on("connection", function connection(ws, req) {
  const urlParams = new URLSearchParams(req.url.split("?")[1]);
  const clientId = urlParams.get("clientId") || uuidv4();
  clients.set(clientId, ws);

  console.log("new client connected: ", clientId);

  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    try {
      const messageObject = JSON.parse(data);
      const targetClientId = messageObject.targetClientId;
      const messageToSend = messageObject.message;

      if (clients.has(targetClientId)) {
        const targetClient = clients.get(targetClientId);
        if (targetClient.readyState === WebSocket.OPEN) {
          targetClient.send(messageToSend, { binary: isBinary });
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  ws.on("close", () => {
    clients.delete(clientId);
  });

  ws.send(
    JSON.stringify({
      message: "Hello! Message From Server!!",
      clientId: clientId,
    }),
  );
});

app.post("/send-message", (req, res) => {
  const { clientId, message, destination } = req.body;
  if (clients.has(clientId)) {
    const targetClient = clients.get(clientId);
    if (targetClient.readyState === WebSocket.OPEN) {
      destination
        ? targetClient.send(JSON.stringify({ message, destination }))
        : targetClient.send(JSON.stringify(message));
      res.status(200).send("Message sent");
    } else {
      res.status(400).send("Client is not connected");
    }
  } else {
    res.status(404).send("Client not found");
  }
});

app.get("/clients", (req, res) => {
  res.json(Array.from(clients.keys()));
});
