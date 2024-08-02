const { default: axios } = require('axios');
const express = require('express');
const app = express();
const Redis = require('ioredis');
const { MongoClient } = require('mongodb');

// Initialize Redis Client
const redis = new Redis({
  host: 'redis-11189.c305.ap-south-1-1.ec2.cloud.redislabs.com',
  port: 11189,
  password: "tUeDrlyLlqfKEvcip3aTdIe5FnSmOpPV",
  connectTimeout: 10000,
  disconnectTimeout: 2000
});

redis.on('connect', function () {
  console.log('Connected to Redis');
});

redis.on('error', function (error) {
  console.error('Redis error', error);
});



// MongoDB connection URI
const uri = "mongodb://127.0.0.1:27017/college"; 

// MongoDB client
const client = new MongoClient(uri);

async function connectMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db("college"); 
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

app.get("/", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/todos"
    );

 // Store data in Redis
 await redis.set("todos", JSON.stringify(data));
 await redis.expire("todos", 30);

  // Store data in MongoDB
  const db = await connectMongoDB();
  const collection = db.collection('todos');
  await collection.insertMany(data);

  return res.json(data);
} catch (error) {
  console.error('Error fetching data or interacting with Redis/MongoDB:', error);
  return res.status(500).json({ error: 'Internal Server Error' });
}
});

app.listen(9000, () => {
console.log("Listening on Port No 9000");
});