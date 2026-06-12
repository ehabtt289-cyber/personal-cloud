import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../utils/cloudinary.js";
import pool from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

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
    const { type, tag } = req.query;
    let query = `SELECT * FROM media WHERE 1=1`;
    const params = [];
    if (type) { params.push(type); query += ` AND type = $${params.length}`; }
    if (tag) { params.push(tag); query += ` AND $${params.length} = ANY(tags)`; }
    query += ` ORDER BY created_at DESC`;
    const { rows } = await pool.query(query, params);
    res.json(rows.map(toMedia));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const isVideo = req.file.mimetype.startsWith("video/");
    const resourceType = isVideo ? "video" : "image";
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `vault/${resourceType}s`,
      resource_type: resourceType,
    });
    const tags = req.body.tags ? req.body.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const { rows } = await pool.query(
      `INSERT INTO media (title, url, public_id, type, format, size, tags, thumbnail)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        req.body.title || req.file.originalname,
        result.secure_url,
        result.public_id,
        resourceType,
        result.format,
        result.bytes,
        tags,
        isVideo ? result.secure_url.replace(/\.[^.]+$/, ".jpg") : result.secure_url,
      ]
    );
    res.status(201).json(toMedia(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, tags } = req.body;
    const { rows } = await pool.query(
      `UPDATE media SET title=$1, tags=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [title, tags || [], req.params.id]
    );
    res.json(toMedia(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM media WHERE id=$1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    await cloudinary.uploader.destroy(rows[0].public_id, { resource_type: rows[0].type });
    await pool.query(`DELETE FROM media WHERE id=$1`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function toMedia(row) {
  return {
    _id: row.id,
    title: row.title,
    url: row.url,
    publicId: row.public_id,
    type: row.type,
    format: row.format,
    size: row.size,
    tags: row.tags || [],
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default router;
