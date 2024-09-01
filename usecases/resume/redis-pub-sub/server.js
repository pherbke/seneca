import express from "express";
import { createClient } from "redis";
import pkg from "better-sse";
import cors from "cors";
const { createSession } = pkg;

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

const client = createClient();
const subscriberClient = client.duplicate();
const publisherClient = client.duplicate();

client.on("error", (err) => console.error("Redis Client Error:", err));
subscriberClient.on("error", (err) =>
  console.error("Redis Subscriber Client Error:", err),
);
publisherClient.on("error", (err) =>
  console.error("Redis Publisher Client Error:", err),
);

// Important : UserId === topic

const topics = new Map();
const offlineMessages = new Map();
const userConnections = new Map();

app.get("/topic/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (topics.has(id)) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error GET /topic:id:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/sse", async (req, res) => {
  const session = await createSession(req, res);
  const userId = req.query.userId;
  userConnections.set(userId, session);
  console.log("Client connected: ", userId);

  const messages = offlineMessages.get(userId) || [];
  if (messages) {
    console.log("Delivering offline messages: ", userId);
    messages.forEach((msg) => {
      sendMessageToUser(userId, msg);
    });
    offlineMessages.delete(userId);
  }
});

app.post("/topic", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).send("Bad request: Topic is required");
    }

    if (topics.has(topic)) {
      return res.status(400).send("Topic already exists");
    }
    topics.set(topic, []);
    await client.sAdd("topics", topic);
    console.log("New topic created: ", topic);
    res.status(201).send("Topic created");
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/publish", async (req, res) => {
  const { topic, message } = req.body;
  if (!topics.has(topic)) {
    return res.status(400).send("Topic does not exist");
  }
  try {
    await publisherClient.publish(topic, JSON.stringify(message));
    res.status(200).send("Message published");
  } catch (error) {
    console.error("Error publishing message:", error);
    res.status(500).send("Failed to publish message");
  }
});

app.post("/subscribe", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).send("Bad request: Topic is required");
    }

    if (!topics.has(topic)) {
      return res.status(400).send("Topic does not exist");
    }

    await subscriberClient.subscribe(topic, listener);

    console.log("Subscribed to topic: ", topic);

    res.status(200).send("Subscribed to topic successfully");
  } catch (error) {
    console.error("Error in subscribe route:", error);
    res.status(500).send("Internal server error");
  }
});

const listener = async (message, topic) => {
  console.log(`Received message for topic ${topic}`);
  const session = userConnections.get(topic);
  if (session && session.isConnected) {
    sendMessageToUser(topic, message);
  } else {
    console.log(`User ${topic} is offline, saving message`);
    let userMessages = offlineMessages.get(topic) || [];
    userMessages.push(message);
    offlineMessages.set(topic, userMessages);
  }
};

function sendMessageToUser(userId, message) {
  const connection = userConnections.get(userId);
  if (connection.isConnected) {
    connection.push(JSON.parse(message));
  } else {
  }
}

async function loadTopicsFromRedis() {
  try {
    const savedTopics = await client.sMembers("topics");
    savedTopics.forEach(async (topic) => {
      topics.set(topic, []);
      await subscriberClient.subscribe(topic, listener);
    });
    console.log("Loaded topics from Redis: ", savedTopics);
  } catch (error) {
    console.error("Error loading topics from Redis:", error);
  }
}

async function startServer() {
  try {
    await client.connect();
    await subscriberClient.connect();
    await publisherClient.connect();

    console.log("Connected to Redis");

    await loadTopicsFromRedis();

    app.listen(3001, () => {
      console.log("Server is running on port 3001");
    });
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startServer();
