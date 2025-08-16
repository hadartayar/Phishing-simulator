import { Router } from "express";
import { db } from "../db.js";
import { campaignCreateSchema, campaignUpdateSchema } from "../utils/validators.js";

export const campaignsRouter = Router();

// Helper to compute stats for a campaign
function getCampaignStats(campaignId) {
  const total = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients WHERE campaignId = ?").get(campaignId).c;
  const opened = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients WHERE campaignId = ? AND openedAt IS NOT NULL").get(campaignId).c;
  const clicked = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients WHERE campaignId = ? AND clickedAt IS NOT NULL").get(campaignId).c;
  const reported = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients WHERE campaignId = ? AND reportedAt IS NOT NULL").get(campaignId).c;
  return { total, opened, clicked, reported, openRate: total ? opened/total : 0, clickRate: total ? clicked/total : 0, reportRate: total ? reported/total : 0 };
}

campaignsRouter.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, t.name as templateName 
    FROM campaigns c
    JOIN templates t ON t.id = c.templateId
    ORDER BY c.id DESC
  `).all();
  const withStats = rows.map(c => ({ ...c, stats: getCampaignStats(c.id) }));
  res.json(withStats);
});

campaignsRouter.get("/:id", (req, res) => {
  const c = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(req.params.id);
  if (!c) return res.status(404).json({ error: "Campaign not found" });
  const template = db.prepare("SELECT * FROM templates WHERE id = ?").get(c.templateId);
  const recipients = db.prepare(`
    SELECT cr.*, r.email, r.name, r.department
    FROM campaign_recipients cr
    JOIN recipients r ON r.id = cr.recipientId
    WHERE cr.campaignId = ?
    ORDER BY cr.id DESC
  `).all(c.id);
  res.json({ ...c, template, recipients, stats: getCampaignStats(c.id) });
});

campaignsRouter.post("/", (req, res) => {
  const parsed = campaignCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const { name, templateId, recipientIds, scheduledAt } = parsed.data;
  const t = db.prepare("SELECT id FROM templates WHERE id = ?").get(templateId);
  if (!t) return res.status(400).json({ error: "Template not found" });
  // validate recipients exist
  const missing = recipientIds.filter(id => !db.prepare("SELECT id FROM recipients WHERE id = ?").get(id));
  if (missing.length) return res.status(400).json({ error: `Recipients not found: ${missing.join(", ")}` });

  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    const info = db.prepare(`INSERT INTO campaigns (name, templateId, status, scheduledAt, createdAt, updatedAt) VALUES (?,?,?,?,?,?)`)
      .run(name, templateId, 'draft', scheduledAt ?? null, now, now);
    const cid = info.lastInsertRowid;
    const insertCR = db.prepare(`INSERT INTO campaign_recipients (campaignId, recipientId, createdAt, updatedAt) VALUES (?,?,?,?)`);
    for (const rid of recipientIds) {
      insertCR.run(cid, rid, now, now);
    }
    return cid;
  });
  const cid = tx();
  const created = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(cid);
  res.status(201).json(created);
});

campaignsRouter.patch("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Campaign not found" });
  const parsed = campaignUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const merged = {
    name: parsed.data.name ?? existing.name,
    templateId: parsed.data.templateId ?? existing.templateId,
    scheduledAt: parsed.data.scheduledAt ?? existing.scheduledAt
  };
  if (!db.prepare("SELECT id FROM templates WHERE id = ?").get(merged.templateId)) {
    return res.status(400).json({ error: "Template not found" });
  }
  const now = new Date().toISOString();
  db.prepare(`UPDATE campaigns SET name=?, templateId=?, scheduledAt=?, updatedAt=? WHERE id=?`)
    .run(merged.name, merged.templateId, merged.scheduledAt, now, existing.id);
  const updated = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(existing.id);
  res.json(updated);
});

campaignsRouter.delete("/:id", (req, res) => {
  const info = db.prepare("DELETE FROM campaigns WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Campaign not found" });
  res.status(204).send();
});

// Launch a campaign: mark all recipients as sent now and set status to launched
campaignsRouter.post("/:id/launch", (req, res) => {
  const campaign = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(req.params.id);
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare("UPDATE campaigns SET status='launched', updatedAt=? WHERE id=?").run(now, campaign.id);
    db.prepare("UPDATE campaign_recipients SET sentAt=?, updatedAt=? WHERE campaignId=?").run(now, now, campaign.id);
  });
  tx();
  res.json({ ok: true });
});

// Metrics
campaignsRouter.get("/__metrics/summary", (req, res) => {
  const totals = db.prepare("SELECT COUNT(*) as c FROM campaigns").get().c;
  const drafts = db.prepare("SELECT COUNT(*) as c FROM campaigns WHERE status='draft'").get().c;
  const launched = db.prepare("SELECT COUNT(*) as c FROM campaigns WHERE status='launched'").get().c;

  const totalCR = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients").get().c;
  const opened = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients WHERE openedAt IS NOT NULL").get().c;
  const clicked = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients WHERE clickedAt IS NOT NULL").get().c;
  const reported = db.prepare("SELECT COUNT(*) as c FROM campaign_recipients WHERE reportedAt IS NOT NULL").get().c;

  res.json({
    campaigns: { total: totals, drafts, launched },
    recipients: { total: totalCR, opened, clicked, reported },
    rates: {
      openRate: totalCR ? opened/totalCR : 0,
      clickRate: totalCR ? clicked/totalCR : 0,
      reportRate: totalCR ? reported/totalCR : 0,
    }
  });
});
