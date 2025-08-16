import { Router } from "express";
import { db } from "../db.js";

export const eventsRouter = Router();

// 1x1 transparent PNG
const PIXEL = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000154010a0b0000000049454e44ae426082",
  "hex"
);

// Tracking pixel - logs 'open'
eventsRouter.get("/t/:id.png", (req, res) => {
  const row = db.prepare("SELECT * FROM campaign_recipients WHERE id = ?").get(req.params.id);
  if (row) {
    const now = new Date().toISOString();
    if (!row.openedAt) {
      db.prepare("UPDATE campaign_recipients SET openedAt=?, updatedAt=? WHERE id=?")
        .run(now, now, row.id);
    }
  }
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.send(PIXEL);
});

// Redirect link - logs 'click'
eventsRouter.get("/r/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM campaign_recipients WHERE id = ?").get(req.params.id);
  const target = req.query.u && typeof req.query.u === 'string' ? decodeURIComponent(req.query.u) : "https://example.com";
  if (row) {
    const now = new Date().toISOString();
    if (!row.clickedAt) {
      db.prepare("UPDATE campaign_recipients SET clickedAt=?, updatedAt=? WHERE id=?")
        .run(now, now, row.id);
    }
  }
  res.redirect(target);
});

// Report button - logs 'reported'
eventsRouter.post("/report", (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: "Missing id" });
  const row = db.prepare("SELECT * FROM campaign_recipients WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const now = new Date().toISOString();
  if (!row.reportedAt) {
    db.prepare("UPDATE campaign_recipients SET reportedAt=?, updatedAt=? WHERE id=?")
      .run(now, now, row.id);
  }
  res.json({ ok: true });
});
