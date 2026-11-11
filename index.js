import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import { createRemoteJWKSet, jwtVerify } from "jose";

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
const bookingsCollection = db.collection("bookings");
const wishlistCollection = db.collection("wishlist");

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

const VerifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Invalid token" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized" });
  }
};

const toMinutes = (timeStr) => {
  const [hours, minutes] = String(timeStr).split(":").map(Number);
  return hours * 60 + minutes;
};

// studios
app.post("/studios", VerifyToken, async (req, res) => {
  const studio = req.body;
  const result = await studiosCollection.insertOne({
    ...studio,
    createdAt: new Date(),
  });
  return res.status(201).send(result);
});

app.get("/studios", async (req, res) => {
  const studio = await studiosCollection.find({}).toArray();
  res.send(studio);
});

app.get("/studio/:id", async (req, res) => {
  const { id } = req.params;
  const studio = await studiosCollection.findOne({ _id: new ObjectId(id) });
  res.send(studio);
});

app.patch("/studio/:id", VerifyToken, async (req, res) => {
  const { id } = req.params;
  const updatedStudio = req.body;
  const result = await studiosCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedStudio },
  );
  res.send(result);
});

app.delete("/studios/:id", VerifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await studiosCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.get("/featured-studios", async (req, res) => {
  const result = await studiosCollection
    .find()
    .sort({ _id: -1 })
    .limit(6)
    .toArray();
  res.send(result);
});

// listings
app.get("/my-listings", VerifyToken, async (req, res) => {
  const { email } = req.query;
  const listings = await studiosCollection.find({ userEmail: email }).toArray();
  res.send(listings);
});

// bookings
app.post("/bookings", VerifyToken, async (req, res) => {
  const bookingData = req.body;

  const { studioId, date, startTime, hours } = bookingData;
  const durationHours = Number(hours);
  const newStart = toMinutes(startTime);
  const newEnd = newStart + durationHours * 60;

  if (
    !studioId ||
    !date ||
    Number.isNaN(newStart) ||
    Number.isNaN(durationHours) ||
    durationHours <= 0
  ) {
    return res.status(400).send({
      message: "Invalid booking date, start time, or duration.",
    });
  }

  const confirmedBookings = await bookingsCollection
    .find({
      studioId,
      date,
      status: "Confirmed",
    })
    .toArray();

  const conflictingBooking = confirmedBookings.find((existing) => {
    const existingStart = toMinutes(existing.startTime);
    const existingEnd = existingStart + Number(existing.hours) * 60;
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (conflictingBooking) {
    return res.status(409).send({
      message: `This studio is already booked from ${conflictingBooking.startTime} for ${conflictingBooking.hours} hr(s) on ${date}. Please choose another time slot.`,
    });
  }

  const result = await bookingsCollection.insertOne({
    ...bookingData,
    status: "Pending",
    bookedAt: new Date(),
  });
  res.status(201).send(result);
});

app.get("/bookings", VerifyToken, async (req, res) => {
  const { email } = req.query;
  const query = email ? { userEmail: email } : {};
  const bookings = await bookingsCollection.find(query).toArray();
  res.send(bookings);
});

app.patch("/bookings/:id", VerifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await bookingsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
  );
  res.send(result);
});

// wishlist
app.post("/wishlist", VerifyToken, async (req, res) => {
  const wishlist = req.body;
  const result = await wishlistCollection.insertOne({
    ...wishlist,
    savedAt: new Date(),
  });
  res.send(result);
});

app.get("/wishlist", VerifyToken, async (req, res) => {
  const { email } = req.query;
  const items = await wishlistCollection.find({ userEmail: email }).toArray();
  res.send(items);
});

app.delete("/wishlist", VerifyToken, async (req, res) => {
  const { email, studioId } = req.query;
  const result = await wishlistCollection.deleteOne({
    userEmail: email,
    studioId,
  });
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});

export default app;
