import express from "express";
import pool from "../utils/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const [notes, images, videos, files, mediaSize, filesSize] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM notes`),
      pool.query(`SELECT COUNT(*) FROM media WHERE type='image'`),
      pool.query(`SELECT COUNT(*) FROM media WHERE type='video'`),
      pool.query(`SELECT COUNT(*) FROM vault_files`),
      pool.query(`SELECT COALESCE(SUM(size),0) AS total FROM media`),
      pool.query(`SELECT COALESCE(SUM(size),0) AS total FROM vault_files`),
    ]);

    const notesCount = parseInt(notes.rows[0].count);
    const imagesCount = parseInt(images.rows[0].count);
    const videosCount = parseInt(videos.rows[0].count);
    const filesCount = parseInt(files.rows[0].count);

    res.json({
      notesCount,
      imagesCount,
      videosCount,
      filesCount,
      totalItems: notesCount + imagesCount + videosCount + filesCount,
      totalSize: parseInt(mediaSize.rows[0].total) + parseInt(filesSize.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
