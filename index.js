const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
// middleware

app.use(cors());
app.use(express.json());
// require("./index.js");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g7zap.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("CoddingServer");
    const sectorsCollections = database.collection("sectors");
    const userDetailsInfoCollection = database.collection("userDetailsInfo");
    const userCollection = database.collection("user");

    // usersdetail post api
    app.post("/sector", async (req, res) => {
      const sector = req.body;
      const result = await sectorsCollections.insertOne(sector);
      res.json(result);
    });
    app.post("/usersDetailInfo", async (req, res) => {
      const userInfo = req.body;
      // console.log("first", user);
      const result = await userDetailsInfoCollection.insertOne(userInfo);
      res.json(result);
    });
    app.get("/sectorsDropdown", async (req, res) => {
      const cursor = sectorsCollections.find({});
      const user = await cursor.toArray();
      res.send(user);
    });
    app.get("/usersDetailInfo", async (req, res) => {
      const cursor = userDetailsInfoCollection.find({});
      const userInfo = await cursor.toArray();
      res.send(userInfo);
    });

    app.put("/usersDetailInfo", async (req, res) => {
      const user = req.body;
      const filter = { id: user._id };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userDetailsInfoCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("codding server two is running");
});

app.listen(port, () => {
  console.log("codding running at port ", port);
});
