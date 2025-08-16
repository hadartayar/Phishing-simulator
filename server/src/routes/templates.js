import { Router } from "express";
import { db } from "../db.js";
import { templateSchema } from "../utils/validators.js";

export const templatesRouter = Router();

templatesRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM templates ORDER BY id DESC").all();
  res.json(rows);
});

templatesRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM templates WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Template not found" });
  res.json(row);
});

templatesRouter.post("/", (req, res) => {
  const parse = templateSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const now = new Date().toISOString();
  const { name, subject, body } = parse.data;
  const stmt = db.prepare(`INSERT INTO templates (name,subject,body,createdAt,updatedAt) VALUES (?,?,?,?,?)`);
  const info = stmt.run(name, subject, body, now, now);
  const row = db.prepare("SELECT * FROM templates WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

templatesRouter.patch("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM templates WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Template not found" });
  const merged = {
    name: req.body.name ?? existing.name,
    subject: req.body.subject ?? existing.subject,
    body: req.body.body ?? existing.body,
  };
  const parse = templateSchema.safeParse(merged);
  if (!parse.success) return res.status(400).json({ error: parse.error.errors });
  const now = new Date().toISOString();
  db.prepare(`UPDATE templates SET name=?, subject=?, body=?, updatedAt=? WHERE id=?`)
    .run(merged.name, merged.subject, merged.body, now, existing.id);
  const row = db.prepare("SELECT * FROM templates WHERE id = ?").get(existing.id);
  res.json(row);
});

templatesRouter.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM templates WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Template not found" });
  res.status(204).send();
});
