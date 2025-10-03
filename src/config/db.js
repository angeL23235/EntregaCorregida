require("dotenv").config();
const mongoose = require("mongoose");

let connected = false;

async function connectDB() {
  if (connected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no definida");
  await mongoose.connect(uri, { });
  connected = true;
  console.log("[DB] Mongo conectado");
}

module.exports = { connectDB };
