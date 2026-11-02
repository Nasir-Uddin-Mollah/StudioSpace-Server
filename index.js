import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import "dotenv/config";

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB();
const db = connectedClient.db("studiospacedb");
const studiosCollection = db.collection("studios");

app.post("/studios", async (req, res) => {
  const studio = req.body;
  const result = await studiosCollection.insertOne({
    ...studio,
    createdAt: new Date(),
  });
  return res.status(201).send(result);
});

app.get("/my-listings", async (req, res) => {
  const email = req.query.email;
  const listings = await studiosCollection.find({ userEmail: email }).toArray();
  res.send(listings);
});

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
