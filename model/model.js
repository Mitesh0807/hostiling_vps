const mongoose = require("mongoose");
const { Schema } = mongoose;

const getImage = (image) => {
  if (image) {
    return `https://bigbillionstore.in/image/${image}`;
  } else {
    return "";
  }
};
// Connect to MongoDB
mongoose.connect("mongodb://0.0.0.0:27017/e_com", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User Schema
const userSchema = new Schema({
  username: { type: String, required: true, maxLength: 50 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, maxLength: 120 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Define UserSession Schema
const userSessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, maxLength: 300 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Define Product Schema
const productSchema = new Schema({
  name: { type: String, required: true, maxLength: 120 },
  size: { type: Schema.Types.Mixed }, // Allow mixed data types
  color: { type: String, required: true, maxLength: 120 },
  price: { type: Number, required: true },
  brand: { type: String, required: true, maxLength: 120 },
  offer: { type: String, maxLength: 50 },
  mrp: { type: Number },
  is_show: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Define Image Schema
const imageSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  image: { type: String, required: true, get: getImage },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

productSchema.virtual("images", {
  ref: "Image", // Reference to the Image model
  localField: "_id", // Field from the current document (Product) to match with the foreignField in the Image model
  foreignField: "product", // Field in the Image model to match with the localField in the Product model
  justOne: false, // Set to false if you want an array of images, true if you want a single image
});

// Define Cart Schema
const cartSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const adjustedCartSchema = new Schema({
  cart: { type: Schema.Types.ObjectId, ref: "Cart" }, // Reference to the Cart table
  adjustedCreatedAt: { type: Date, required: true },
});

// Define Address Schema
const addressSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true, maxLength: 20 },
  phonenumber: { type: Number },
  pincode: { type: Number },
  state: { type: String, required: true, maxLength: 120 },
  city: { type: String, required: true, maxLength: 120 },
  street: { type: String, required: true, maxLength: 120 },
  area: { type: String, maxLength: 120 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Define AdminCredentials Schema
const adminCredentialsSchema = new Schema({
  paytm_upi_id: { type: String, maxLength: 120 },
  phonepe_upi_id: { type: String, maxLength: 120 },
  gpay_upi_id: { type: String, maxLength: 120 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Create models from schemas
const User = mongoose.model("User", userSchema);
const UserSession = mongoose.model("UserSession", userSessionSchema);
const Product = mongoose.model("Product", productSchema);
const Images = mongoose.model("Image", imageSchema);
const Cart = mongoose.model("Cart", cartSchema);
const Address = mongoose.model("Address", addressSchema);
const AdminCredentials = mongoose.model(
  "AdminCredentials",
  adminCredentialsSchema,
);
const adjustedCart = mongoose.model("adjustedCart", adjustedCartSchema);

module.exports = {
  User,
  UserSession,
  Product,
  Images,
  Cart,
  Address,
  AdminCredentials,
  adjustedCart,
};
