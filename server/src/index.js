import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { db } from "./db.js";
import { templatesRouter } from "./routes/templates.js";
import { recipientsRouter } from "./routes/recipients.js";
import { campaignsRouter } from "./routes/campaigns.js";
import { eventsRouter } from "./routes/events.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(morgan("dev"));

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api/templates", templatesRouter);
app.use("/api/recipients", recipientsRouter);
app.use("/api/campaigns", campaignsRouter);
// metrics route nested inside campaigns router is GET /api/campaigns/__metrics/summary
app.use("/", eventsRouter);

// Seed (optional)
function seedIfEmpty() {
  const tCount = db.prepare("SELECT COUNT(*) as c FROM templates").get().c;
  const rCount = db.prepare("SELECT COUNT(*) as c FROM recipients").get().c;
  if (tCount === 0) {
    const now = new Date().toISOString();
    db.prepare("INSERT INTO templates (name,subject,body,createdAt,updatedAt) VALUES (?,?,?,?,?)")
      .run("Password Reset", "Action Required: Password Reset", 
      "Hi {{name}},\n\nWe detected unusual activity. Please reset your password: {{link}}\n\nIT Security", now, now);
    db.prepare("INSERT INTO templates (name,subject,body,createdAt,updatedAt) VALUES (?,?,?,?,?)")
      .run("Payroll Update", "Update your bank details", 
      "Dear {{name}},\nYour payroll info needs verification. Click here: {{link}}\nHR", now, now);
  }
  if (rCount === 0) {
    const now = new Date().toISOString();
    const insert = db.prepare("INSERT INTO recipients (email,name,department,createdAt,updatedAt) VALUES (?,?,?,?,?)");
    insert.run("alice@example.com", "Alice", "Engineering", now, now);
    insert.run("bob@example.com", "Bob", "Finance", now, now);
    insert.run("charlie@example.com", "Charlie", "Sales", now, now);
  }
}
seedIfEmpty();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
