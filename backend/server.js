require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const electionRoutes = require("./routes/elections");

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/elections", electionRoutes);

app.get("/api/health", (_req, res) =>
  res.json({ status: "OK", module: "Electoral Analytics", time: new Date().toISOString() })
);

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  CYBERJOAR — ELECTORAL ANALYTICS  |  PORT ${PORT}      ║`);
  console.log(`║  GET  /api/elections                                 ║`);
  console.log(`║  GET  /api/elections/simulate?factor_idx=value       ║`);
  console.log(`║  GET  /api/health                                    ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);
});
