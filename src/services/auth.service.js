import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const logoutUser = async (refreshToken) => {
  // In a more advanced implementation, you would:
  // 1. Store refresh tokens in database
  // 2. Mark the refresh token as revoked
  // 3. Add it to a blacklist
  
  // For now, we'll just return success
  // The client should discard both tokens
  return { message: "Logged out successfully" };
};