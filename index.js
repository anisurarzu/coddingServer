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
    const userDetailsCollection = database.collection("userDetails");
    const userDetailsInfoCollection = database.collection("userDetailsInfo");
    const userCollection = database.collection("user");

    //get single user

    app.get("/users/scholar/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const singleScholar = await userCollection?.findOne(query);
      res.json(singleScholar);
    });

    // usersdetail post api
    app.post("/usersDetail", async (req, res) => {
      const user = req.body;
      // console.log("first", user);
      const result = await userDetailsCollection.insertOne(user);
      res.json(result);
    });
    app.post("/usersDetailInfo", async (req, res) => {
      const userInfo = req.body;
      // console.log("first", user);
      const result = await userDetailsInfoCollection.insertOne(userInfo);
      res.json(result);
    });
    app.get("/sectorsDropdown", async (req, res) => {
      const cursor = userDetailsCollection.find({});
      const user = await cursor.toArray();
      res.send(user);
    });
    app.get("/usersDetailInfo", async (req, res) => {
      const cursor = userDetailsInfoCollection.find({});
      const userInfo = await cursor.toArray();
      res.send(userInfo);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // img upload

    app.put("/users/profile/image", async (req, res) => {
      const user = req.body;
      console.log(user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: { image: user.image } };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.put("/deposit", async (req, res) => {
      const depositInfo = req.body;
      console.log(depositInfo);
      const filter = { _id: ObjectId(depositInfo?.depositID) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { status: depositInfo.status },
      };
      const result = await loanCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // delete question api

    app.delete("/questions/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await questionCollection.deleteOne(query);
      res.json(result);
    });

    // update question with answer
    app.put("/questions/answer", async (req, res) => {
      const answer = req.body;
      console.log(answer);
      const filter = { _id: ObjectId(answer.id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: { answer: answer.answer, answeredBy: answer.answeredBy },
      };
      const result = await questionCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //  create an event
    // event post api

    app.post("/events", async (req, res) => {
      const event = req.body;
      const result = await eventCollection.insertOne(event);
      res.json(result);
    });

    // get event by single user
    app.get("/events", async (req, res) => {
      const cursor = eventCollection.find({});
      const event = await cursor.toArray();
      res.send(event);
    });
    // put event
    app.put("/events/booking", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const filter = { _id: ObjectId(booking?.eventId) };
      const options = { upsert: true };
      const updateDoc = {
        $push: { booking: booking },
      };
      const result = await eventCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    // get event details
    app.get("/event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const event = await eventCollection.findOne(query);
      res.json(event);
    });

    //delete event
    app.delete("/event/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await eventCollection.deleteOne(query);
      res.json(result);
    });

    // booking status post
    app.post("/bookingStatus", async (req, res) => {
      const status = req.body;
      const result = await statusCollection.insertOne(status);
      res.json(result);
    });

    // get booking status
    app.get("/bookingStatus", async (req, res) => {
      const cursor = statusCollection.find({});
      const status = await cursor.toArray();
      res.send(status);
    });

    // schedule post
    app.post("/schedule", async (req, res) => {
      const schedule = req.body;
      const result = await scheduleCollection.insertOne(schedule);
      res.json(result);
    });
    // get schedule
    app.get("/schedule", async (req, res) => {
      const cursor = scheduleCollection.find({});
      const schedule = await cursor.toArray();
      res.send(schedule);
    });

    // update schedule dates
    app.put("/schedule/bookingInfo", async (req, res) => {
      const bookingInfo = req.body;
      const filter = { _id: ObjectId(bookingInfo?.scholarId) };
      const options = { upsert: true };
      const updateDoc = {
        $push: { bookedDates: bookingInfo.bookedDates },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // update schedule status on booking status collection
    app.put("/schedule/bookingStatus", async (req, res) => {
      const bookingInfo = req.body;
      console.log(bookingInfo);
      const filter = { _id: ObjectId(bookingInfo?.scheduleId) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { status: bookingInfo.status },
      };
      const result = await scheduleCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // stripe payment
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    });

    // post payment success information
    app.post("/paymentInfo", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.json(result);
    });

    // get payment information
    // get event by single user
    app.get("/paymentInfo", async (req, res) => {
      const cursor = paymentCollection.find({});
      const payment = await cursor.toArray();
      res.send(payment);
    });

    // get scholar islamic foundation id
    app.get("/scholarId", async (req, res) => {
      const cursor = scholarIdCollection.find({});
      const scholarId = await cursor.toArray();
      res.send(scholarId);
    });

    // //post reviews
    // app.post("/reviews", async (req, res) => {
    //   const review = req.body;
    //   const result = await reviewCollection.insertOne(review);
    //   res.json(result);
    // });
    // //get reviews
    // app.get("/reviews", async (req, res) => {
    //   const cursor = reviewCollection.find({});
    //   const reviews = await cursor.toArray();
    //   res.send(reviews);
    // });
    // //post product api

    // app.post("/products", async (req, res) => {
    //   const product = req.body;
    //   const result = await productCollection.insertOne(product);
    //   res.json(result);
    // });

    // // post api(order)
    // app.post("/orders", async (req, res) => {
    //   const order = req.body;
    //   const result = await orderCollection.insertOne(order);
    //   res.json(result);
    // });
    // // // update/put order status api

    // app.put("/orders/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updateOrder = req.body;
    //   const filter = { _id: ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       status: updateOrder.status,
    //     },
    //   };
    //   const result = await orderCollection.updateOne(
    //     filter,
    //     updateDoc,
    //     options
    //   );
    //   res.json(result);
    // });

    // // // delete api(orders)

    // app.delete("/orders/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const result = await orderCollection.deleteOne(query);
    //   res.json(result);
    // });
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
