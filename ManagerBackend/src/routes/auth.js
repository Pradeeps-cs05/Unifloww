import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ROLE_PERMISSIONS } from "../config/permissions.js";

dotenv.config();
const router = express.Router();

// ------------------- GOOGLE OAUTH2 SETUP -------------------
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const client_app_path = process.env.CLIENT_APP_PATH;

// ------------------- HELPER FUNCTION -------------------
async function sendPasswordResetEmail(email, resetURL) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kalidasrajen@gmail.com", // your Gmail address
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: "UniFloww <kalidasrajen@gmail.com>",
      to: email,
      subject: "Reset Your Password - UniFloww",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click below to reset it:</p>
        <a href="${resetURL}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Reset email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}


// ------------------- SIGNUP -------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide name, email and password" });
    }

    // DEBUG: log connection + incoming email
    console.log("Signup request - email:", JSON.stringify(email));
    console.log("Mongoose DB name:", mongoose.connection?.name);
    console.log("Mongoose host:", mongoose.connection?.host);
    console.log("Mongoose readyState:", mongoose.connection?.readyState);

    const existing = await User.findOne({ email });
    console.log("Existing user check result:", existing); // null or document

    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Determine if this is the first user (root admin)
    const userCount = await User.countDocuments();
    const isRootAdmin = userCount === 0;
    const role = isRootAdmin ? "root_admin" : "user";
    const permissions = ROLE_PERMISSIONS[role];

    // Create user
    const user = await User.create({
      username: name,
      email,
      password: hashed,
      role,
      permissions,
    });

    console.log("Created user:", {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    console.log("Created user:", { id: user._id, username: user.username, email: user.email });
    return res.status(201).json({
      message: isRootAdmin ? "Root admin created" : "User created",
      userId: user._id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// ------------------- LOGIN -------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug: incoming request and DB state
    console.log("Login request - email:", JSON.stringify(email));
    console.log(
      "Mongoose DB:",
      "name=",
      mongoose.connection?.name,
      "host=",
      mongoose.connection?.host,
      "readyState=",
      mongoose.connection?.readyState
    );

    // Find user
    const user = await User.findOne({ email });
    console.log(
      "Found user for login:",
      user ? { id: user._id.toString(), username: user.username, email: user.email } : null
    );

    if (!user) {
      console.log("Login failed - user not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Login failed - incorrect password for user id:", user._id.toString());
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
        email: user.email,
      },
      process.env.JWT_SECRET,
      process.env.JWT_SECRET_EXPIRES_IN ? { expiresIn: process.env.JWT_SECRET_EXPIRES_IN } : undefined
    );

    console.log("Login successful for user id:", user._id.toString());
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ------------------- FORGOT PASSWORD -------------------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always respond success (avoid email enumeration)
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `${client_app_path}/reset-password/${token}`;

    await sendPasswordResetEmail(user.email, resetURL);

    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// --- RESET PASSWORD ---
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token is invalid or has expired" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
