import { Router } from "express";
import { db } from "../db.js";
import { recipientSchema } from "../utils/validators.js";

export const recipientsRouter = Router();

recipientsRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM recipients ORDER BY id DESC").all();
  res.json(rows);
});

recipientsRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM recipients WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Recipient not found" });
  res.json(row);
});

recipientsRouter.post("/", (req, res) => {
  const parse = recipientSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const now = new Date().toISOString();
  const { email, name, department } = parse.data;
  try {
    const info = db.prepare(`INSERT INTO recipients (email,name,department,createdAt,updatedAt) VALUES (?,?,?,?,?)`)
      .run(email, name, department, now, now);
    const row = db.prepare("SELECT * FROM recipients WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(row);
  } catch (e) {
    if (String(e).includes("UNIQUE")) {
      return res.status(409).json({ error: "Recipient with this email already exists" });
    }
    throw e;
  }
});

recipientsRouter.patch("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM recipients WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Recipient not found" });
  const merged = {
    email: req.body.email ?? existing.email,
    name: req.body.name ?? existing.name,
    department: req.body.department ?? existing.department,
  };
  const parse = recipientSchema.safeParse(merged);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const now = new Date().toISOString();
  try {
    db.prepare(`UPDATE recipients SET email=?, name=?, department=?, updatedAt=? WHERE id=?`)
      .run(merged.email, merged.name, merged.department, now, existing.id);
  } catch (e) {
    if (String(e).includes("UNIQUE")) {
      return res.status(409).json({ error: "Recipient with this email already exists" });
    }
    throw e;
  }
  const row = db.prepare("SELECT * FROM recipients WHERE id = ?").get(existing.id);
  res.json(row);
});

recipientsRouter.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM recipients WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Recipient not found" });
  res.status(204).send();
});
