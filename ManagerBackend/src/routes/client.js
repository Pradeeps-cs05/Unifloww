import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import Client from "../models/Client.js";
import Counter from "../models/Counter.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { PERMISSIONS } from "../config/permissions.js";
import auth from "../middleware/auth.js"; // JWT auth middleware that sets req.user
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const router = express.Router();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Multer setup for file uploads
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
},
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const filename = Date.now() + "-" + file.originalname;
      cb(null, filename);
    },
  }),
});

// -------------------------------------------------------
// Add Client
// -------------------------------------------------------
router.post(
  "/add",
  auth,                                  // must be logged in
  requirePermission(PERMISSIONS.CREATE), // must have CREATE permission
  upload.array("documents"),             // handle file uploads
  async (req, res) => {

    try {


      const { email } = req.body;

      // Case-insensitive check if email already exists
      const existingClient = await Client.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
      if (existingClient) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Auto-increment client ID
      const counter = await Counter.findOneAndUpdate(
        { name: "client" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const uniqueId = counter.seq;

      const docs = (req.files || []).map((file) => ({
        filename: file.key,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: file.location,
      }));

      // Automatically set creator + updater from logged-in user
      const createdBy = req.user?.email || "Unknown";

      const client = await Client.create({
        uniqueId,
        ...req.body,
        documents: docs,
        createdBy: createdBy,
      });

      res.status(201).json({ message: "Client created", client });
    } catch (err) {
      console.error("Add client error:", err);
      res.status(500).json({ error: "Failed to add client" });
    }
  });


// -------------------------------------------------------
// Search Client
// -------------------------------------------------------
// -------------------------------------------------------
// Search Client (partial match, multiple results)
// -------------------------------------------------------
router.get(
  "/search",
  auth,                                  // must be logged in
  requirePermission(PERMISSIONS.READ), // must have READ or READ_OWN permission
  async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ error: "No query provided" });

      const regex = new RegExp(query, "i");

      // 🔹 Build base filter for name, email, or uniqueId
      let filter = {
        $or: [
          { name: regex },
          { email: regex },
          ...(isNaN(Number(query)) ? [] : [{ uniqueId: Number(query) }]),
        ],
      };

      // Exclude soft-deleted clients by default
      filter.deleted = { $ne: true };

      // 🔒 Restrict to own data if permissionScope === "own"
      if (req.permissionScope === "own") {
        filter = {
          $and: [filter, { email: req.user.email }], // only return logged-in user's email
        };
      }

      const clients = await Client.find(filter).limit(10);

      if (!clients || clients.length === 0)
        return res.json(clients);

      res.json(clients);
    } catch (err) {
      console.error("Search client error:", err);
      res.status(500).json({ error: "Failed to search client" });
    }
  }
);


// -------------------------------------------------------
// Update Client
// -------------------------------------------------------
router.put(
  "/update/:id",
  auth,                                  // must be logged in
  requirePermission(PERMISSIONS.UPDATE), // must have UPDATE or UPDATE_OWN permission
  upload.array("documents"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const client = await Client.findById(id);
      if (!client) return res.status(404).json({ error: "Client not found" });

      // 🔒 Restrict “own” updates
      if (req.permissionScope === "own" && client.email !== req.user.email) {
        return res.status(403).json({ error: "Forbidden: cannot update other users" });
      }

      // 1️⃣ Handle document deletions
      const removeDocs = req.body.removeDocs ? JSON.parse(req.body.removeDocs) : [];
      if (removeDocs.length > 0) {
        client.documents = client.documents.filter((doc) => {
          const keep = !removeDocs.includes(doc.filename);
          if (!keep) {
            const filePath = path.join(__dirname, "..", "uploads", doc.filename);
            fs.unlink(filePath, (err) => {
              if (err) console.error("Failed to delete file:", filePath, err);
            });
          }
          return keep;
        });
      }

      // 2️⃣ Add new uploaded documents
      const newDocs = (req.files || []).map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
      }));
      client.documents.push(...newDocs);

      // 3️⃣ Update other fields safely (exclude documents, removeDocs, _id)
      const excludeFields = ["removeDocs", "_id", "documents"];
      Object.keys(req.body).forEach((key) => {
        if (!excludeFields.includes(key)) client[key] = req.body[key];
      });

      // Automatically set creator + updater from logged-in user
      const updatedBy = req.user?.email || "Unknown";

      // 4️⃣ Track updater
      client.updatedBy = updatedBy;

      // 5️⃣ Save changes
      await client.save();

      // ✅ Log successful update with client name
      console.log(`Client "${client.name}" updated successfully.`);

      res.json({ client });
    } catch (err) {
      console.error("Update client error:", err);
      res.status(500).json({ error: "Failed to update client" });
    }
  });


// -------------------------------------------------------
// Get All Clients (Paginated + Searchable + Sortable)
// -------------------------------------------------------
router.get(
  "/all",
  auth,                                // must be logged in
  requirePermission(PERMISSIONS.READ), // must have READ or READ_OWN permission
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
        showDeleted = "false", // optional query param to show deleted clients
      } = req.query;

      const pageNum = Math.max(parseInt(page, 10), 1);
      const pageSize = Math.max(parseInt(limit, 10), 1);

      // 🔍 Build search filter
      const regex = new RegExp(search, "i");
      let filter = search
        ? {
          $or: [
            { name: regex },
            { email: regex },
            ...(isNaN(Number(search)) ? [] : [{ uniqueId: Number(search) }]),
          ],
        }
        : {};

      // Exclude soft-deleted clients by default
      if (showDeleted !== "true") {
        filter.deleted = { $ne: true };
      }

      // 🔒 Restrict to own scope if needed
      if (req.permissionScope === "own") {
        filter = {
          $and: [filter, { email: req.user.email }],
        };
      }

      // 🧮 Get total count
      const total = await Client.countDocuments(filter);

      // 🔢 Fetch paginated clients
      const clients = await Client.find(filter)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .select("-__v");

      res.json({
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        clients,
      });
    } catch (err) {
      console.error("Get all clients error:", err);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  }
);

// -------------------------------------------------------
// Soft Delete Client
// -------------------------------------------------------
router.delete(
  "/delete/:id",
  auth,
  requirePermission(PERMISSIONS.DELETE), // DELETE or DELETE_OWN
  async (req, res) => {
    try {
      const { id } = req.params;

      const client = await Client.findById(id);
      if (!client) return res.status(404).json({ error: "Client not found" });

      // Restrict to own scope
      if (req.permissionScope === "own" && client.email !== req.user.email) {
        return res.status(403).json({ error: "Forbidden: cannot delete other users" });
      }

      // Soft delete: mark as deleted
      client.deleted = true;
      client.deletedAt = new Date();
      await Client.findByIdAndDelete(id);

      console.log(`Client "${client.name}" soft-deleted by ${req.user.email}`);

      res.json({ message: "Client soft-deleted successfully" });
    } catch (err) {
      console.error("Soft delete client error:", err);
      res.status(500).json({ error: "Failed to soft delete client" });
    }
  }
);


export default router;
