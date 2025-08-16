# Phishing Simulator (React + Node.js)

A demo-only CRUD app to create phishing **templates**, manage **recipients**, and build/launch **campaigns** with basic open/click/report tracking.

> ⚠️ For learning purposes only. Not sending real emails.

## Quick Start

### 1) Server
```bash
cd server
cp .env.example .env   # optionally tweak
npm install
npm run dev
# Server on http://localhost:4000
```

### 2) Client
```bash
cd client
npm install
npm run dev
# App on http://localhost:5173
```

You can change the API base from the client by setting `VITE_API_BASE` (defaults to http://localhost:4000).

## Notes

- DB: SQLite via `better-sqlite3` (file `data.db` at project root).
- Tracking pixel: `GET /t/:campaignRecipientId.png` adds an open event.
- Redirect: `GET /r/:campaignRecipientId?u=<encodedUrl>` adds a click event and redirects.
- Report: `POST /report` with `{ id }` marks a report event.

Enjoy! 🎣
