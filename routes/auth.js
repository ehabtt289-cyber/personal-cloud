import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

const VAULT_PASSWORD = "12345678";

router.post("/login", (req, res) => {
  const { password } = req.body;
  if (password !== VAULT_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = jwt.sign({ vaultUser: true }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

router.get("/verify", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ valid: false });
  const token = authHeader.replace("Bearer ", "");
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;
