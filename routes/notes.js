import express from "express";
import pool from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const { tag } = req.query;
    let query, params;
    if (tag) {
      query = `SELECT * FROM notes WHERE $1 = ANY(tags) ORDER BY pinned DESC, updated_at DESC`;
      params = [tag];
    } else {
      query = `SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC`;
      params = [];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows.map(toNote));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM notes WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Note not found" });
    res.json(toNote(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title = "Untitled", content = "", tags = [] } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO notes (title, content, tags) VALUES ($1, $2, $3) RETURNING *`,
      [title, content, tags]
    );
    res.status(201).json(toNote(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, content, tags, pinned } = req.body;
    const { rows } = await pool.query(
      `UPDATE notes SET title=$1, content=$2, tags=$3, pinned=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [title, content, tags || [], pinned ?? false, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Note not found" });
    res.json(toNote(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM notes WHERE id = $1`, [req.params.id]);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function toNote(row) {
  return {
    _id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags || [],
    pinned: row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default router;
