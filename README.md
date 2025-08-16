# Phishing Simulator (React + Node.js)

A demo-only CRUD app to create phishing **templates**, manage **recipients**, and build/launch **campaigns** with basic open/click/report tracking.

> ⚠️ For learning purposes only. Do not use to send real emails.

## Project Structure

```
phishing-simulator/
├── client/                # React (Vite)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── components/
│       │   └── Table.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Campaigns.jsx
│           ├── Templates.jsx
│           └── Recipients.jsx
└── server/                # Node.js (Express + SQLite)
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js
        ├── db.js
        ├── utils/
        │   └── validators.js
        └── routes/
            ├── campaigns.js
            ├── recipients.js
            ├── templates.js
            └── events.js
```

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
