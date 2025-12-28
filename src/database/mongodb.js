const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
  if (db) return db;

  await client.connect();
  console.log("🗄️ Conectado ao MongoDB Atlas");

  db = client.db(process.env.CLIENT_ID);
  return db;
}

module.exports = connectDB;
