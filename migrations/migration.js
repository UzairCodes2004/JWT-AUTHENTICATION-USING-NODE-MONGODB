const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");


dotenv.config({ path: '../.env' });

const User = require("../models/User");
const Product = require("../models/Product");

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected...");

    // 1. Clear old data (optional)
    // await User.deleteMany();
    // await Product.deleteMany();
    // console.log("Old users and products removed.");

    // 2. Create dummy user
    const hashedPassword = await bcrypt.hash("securePass123", 10);
    const user = await User.create({
      name: "Alice Smith",
      username: "alice",
      email: "alice@example.com",
      password: hashedPassword,
    });
    console.log("Dummy user created:", user.username);

    // 3. Create dummy products
    const products = await Product.insertMany([
      {
        name: "Wireless Mouse",
        price: 29.99,
        description: "A smooth, ergonomic wireless mouse with long battery life.",
        user: user._id // link product to user if your schema supports it
      },
      {
        name: "Mechanical Keyboard",
        price: 79.99,
        description: "Durable keyboard with customizable RGB lighting.",
        user: user._id
      },
      {
        name: "Gaming Laptop",
        price: 1299.99,
        description: "High performance laptop with RTX graphics and 16GB RAM.",
        user: user._id
      }
    ]);
    console.log("Dummy products inserted:", products.length);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
