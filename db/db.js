const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://0.0.0.0:27017/e_com", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", () => {
  console.log("MongoDB connection successful");
});

// Import and export models
const {
  User,
  UserSession,
  Product,
  Images,
  Cart,
  Address,
  AdminCredentials,
} = require("../model/model.js");

module.exports = {
  User,
  UserSession,
  Product,
  Images,
  Cart,
  Address,
  AdminCredentials,
  db,
};
