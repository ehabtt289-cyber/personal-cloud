import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../utils/cloudinary.js";
import pool from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(authMiddleware);

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

router.get("/", async (req, res) => {
  try {
    const { tag } = req.query;
    let query = `SELECT * FROM vault_files`;
    const params = [];
    if (tag) { params.push(tag); query += ` WHERE $1 = ANY(tags)`; }
    query += ` ORDER BY created_at DESC`;
    const { rows } = await pool.query(query, params);
    res.json(rows.map(toFile));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: "vault/files",
      resource_type: "raw",
      public_id: `${Date.now()}_${req.file.originalname}`,
    });
    const tags = req.body.tags ? req.body.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const { rows } = await pool.query(
      `INSERT INTO vault_files (title, url, public_id, format, size, mime_type, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        req.body.title || req.file.originalname,
        result.secure_url,
        result.public_id,
        req.file.originalname.split(".").pop(),
        result.bytes,
        req.file.mimetype,
        tags,
      ]
    );
    res.status(201).json(toFile(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, tags } = req.body;
    const { rows } = await pool.query(
      `UPDATE vault_files SET title=$1, tags=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [title, tags || [], req.params.id]
    );
    res.json(toFile(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vault_files WHERE id=$1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    await cloudinary.uploader.destroy(rows[0].public_id, { resource_type: "raw" });
    await pool.query(`DELETE FROM vault_files WHERE id=$1`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function toFile(row) {
  return {
    _id: row.id,
    title: row.title,
    url: row.url,
    publicId: row.public_id,
    format: row.format,
    size: row.size,
    mimeType: row.mime_type,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default router;
