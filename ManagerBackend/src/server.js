import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import clientRoutes from "./routes/client.js";
import fileRoutes from "./routes/file.js";
import path from "path";
import { fileURLToPath } from "url"; // <-- needed for __dirname


dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
// replace/connect logic with explicit logging
const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri, { autoIndex: true })
  .then(() => {
    console.log("MongoDB connected:", mongoUri);
    console.log("DB name:", mongoose.connection.name);
    console.log("DB host:", mongoose.connection.host);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const app = express();

// Middleware
app.use(express.json());

// CORS - allow your frontend origin during development
app.use(
  cors({
    origin: process.env.CLIENT_APP_PATH,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/uploads", express.static("uploads")); // to serve uploaded files
app.use("/api/file", fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(cors({
  origin: "*", // later we restrict
}));