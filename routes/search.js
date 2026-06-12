import express from "express";
import pool from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ notes: [], media: [], files: [] });

    const search = `%${q}%`;
    const [notesRes, mediaRes, filesRes] = await Promise.all([
      pool.query(
        `SELECT * FROM notes WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY updated_at DESC LIMIT 10`,
        [search]
      ),
      pool.query(
        `SELECT * FROM media WHERE title ILIKE $1 ORDER BY created_at DESC LIMIT 10`,
        [search]
      ),
      pool.query(
        `SELECT * FROM vault_files WHERE title ILIKE $1 ORDER BY created_at DESC LIMIT 10`,
        [search]
      ),
    ]);

    res.json({
      notes: notesRes.rows.map((r) => ({
        _id: r.id, title: r.title, content: r.content, tags: r.tags || [],
        createdAt: r.created_at, updatedAt: r.updated_at,
      })),
      media: mediaRes.rows.map((r) => ({
        _id: r.id, title: r.title, url: r.url, type: r.type,
        tags: r.tags || [], createdAt: r.created_at,
      })),
      files: filesRes.rows.map((r) => ({
        _id: r.id, title: r.title, url: r.url, format: r.format,
        tags: r.tags || [], createdAt: r.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
