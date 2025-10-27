// Script to create an owner user directly in the database
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./src/models/user.model.js";

dotenv.config();

const createOwnerUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if owner already exists
    const existingOwner = await User.findOne({ role: "owner" });
    if (existingOwner) {
      console.log("Owner user already exists:", existingOwner.email);
      return;
    }

    // Create owner user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const owner = await User.create({
      name: "System Owner",
      email: "owner@taskhub.com",
      password: hashedPassword,
      role: "owner"
    });

    console.log("✅ Owner user created successfully:");
    console.log("Email:", owner.email);
    console.log("Password: admin123");
    console.log("Role:", owner.role);
    
  } catch (error) {
    console.error("Error creating owner user:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

createOwnerUser();
