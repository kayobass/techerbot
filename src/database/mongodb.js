const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;
    console.log("🗄️ Conectado ao MongoDB Atlas (Mongoose)");
  } catch (err) {
    console.error("❌ Erro ao conectar no MongoDB", err);
  }
}

module.exports = connectDB;
