import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initSchema } from "./utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

import authRouter from "./routes/auth.js";
import notesRouter from "./routes/notes.js";
import mediaRouter from "./routes/media.js";
import filesRouter from "./routes/files.js";
import searchRouter from "./routes/search.js";
import statsRouter from "./routes/stats.js";

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/media", mediaRouter);
app.use("/api/files", filesRouter);
app.use("/api/search", searchRouter);
app.use("/api/stats", statsRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist/index.html"));
  });
}

const PORT = process.env.BACKEND_PORT || 3001;

initSchema()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  });
