const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4321;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://stock-market-app-b5e8e.web.app"],
  credentials: true,
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrqljyn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const dataCollection = client.db("stockMarket").collection("data");

    // Data API
    app.get("/data", async (req, res) => {
      const result = await dataCollection.find().toArray();
      res.send(result);
    });

    app.post("/data", async (req, res) => {
      const dataItem = req.body;
      const result = await dataCollection.insertOne(dataItem);
      res.send(result);
    });

    app.delete("/data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await dataCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/update/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          trade_code: item.trade_code,
          high: item.high,
          low: item.low,
          open: item.open,
          close: item.close,
          volume: item.volume,
          date: item.date,
        },
      };
      const result = await dataCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Don't close the client here, as it will terminate the connection
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Stock market is running");
});

app.listen(port, () => {
  console.log(`Stock market is running on port: ${port}`);
});
