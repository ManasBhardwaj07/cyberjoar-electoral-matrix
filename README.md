# ⬛ CyberJoar — Predictive Electoral Analytics Dashboard

> **Problem Statement 5 — Standalone** — A full-stack MERN application that compares
> three candidates across a six-factor weighted intelligence matrix, computes their
> Probability of Win via a server-side Softmax algorithm, and provides an interactive
> Scenario Simulator for live what-if modelling.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.x-FF6384?style=for-the-badge)](https://recharts.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> No MongoDB. No AWS. No map. Pure algorithm and data visualisation.

---

## Features

- **Candidate Cards** — Three candidates (Incumbent, Challenger, Independent) with animated
  count-up PoW gauges, per-factor score bars, and profile metadata
- **Radar Chart** — All 6 matrix factors overlaid for all 3 candidates simultaneously
- **Bar Chart** — Side-by-side Probability of Win with per-candidate colour coding and
  custom tooltips
- **Strategic Gap Table** — Per-factor leader identification with inline mini progress bars
- **Scenario Simulator** — Adjust any score via sliders, hit RUN, and see recomputed PoW
  deltas and an updated Radar chart via a live API call
- **Weight Config Tab** — Visual breakdown of all 6 constituency-tuned weights with
  sum-to-100% verification
- **Dark Tactical UI** — Monospaced fonts, navy palette, violet accents

---

## Candidate Matrix

| Factor | Weight | Description |
|---|---|---|
| Incumbency Effect | 15% | Office advantage or anti-incumbency drag |
| Party Strength | 25% | Cadre network and brand recognition |
| Past Work Record | 20% | Verified legislative and development activity |
| Personal Base | 15% | Loyal vote bank independent of party |
| Demographic Base | 10% | Religious and community-consolidated vote share |
| Digital Sentiment | 15% | Net OSINT social media and news sentiment score |

---

## Algorithm — Probability of Win

**Step 1 — Weighted Score**
```
rawScore(c) = Σ ( score[factor] × weight[factor] )   for all 6 factors
```

**Step 2 — Temperature-Scaled Softmax (T = 0.8)**
```
exp_i  = e ^ ( rawScore_i / 0.8 )
PoW(i) = exp_i / Σ exp_j           (zero-sum, all candidates)
```

**Step 3 — Turnout Bonus**

Candidates with `personalBase ≥ 80` receive `+4%`. Final pass guarantees `Σ PoW = 100%`.

**Simulation**
```
GET /api/elections/simulate?digitalSentiment_1=95&partyStrength_0=40
```
Overrides base scores and re-runs the full algorithm. Returns updated PoW + radarData.

## Live Deployment

> **🔴 LIVE DEMO:** [Click here to view the deployed dashboard](https://cyberjoar-electoral-matrix.vercel.app/)
> 
> *Note: The backend API is hosted on Render's free tier. It may take 30–50 seconds to spin up on the initial load.*

---

## Local Setup

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5001
```

Expected output:
```
╔══════════════════════════════════════════════════════╗
║  CYBERJOAR — ELECTORAL ANALYTICS  |  PORT 5001      ║
║  GET  /api/elections                                 ║
║  GET  /api/elections/simulate?factor_idx=value       ║
║  GET  /api/health                                    ║
╚══════════════════════════════════════════════════════╝
```

### 2. Frontend

```bash
# New terminal
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173**

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Status check |
| `GET` | `/api/elections` | All candidates + PoW + `radarData` + `barData` |
| `GET` | `/api/elections/simulate` | What-if recomputation via `factor_idx=value` query params |

---

## Project Structure

```
cyberjoar-electoral-standalone/
├── backend/
│   ├── routes/
│   │   └── elections.js    # All candidates, weights, PoW algorithm, /simulate
│   ├── .env.example
│   ├── package.json        # Only: express, cors, dotenv
│   └── server.js           # Mounts /api/elections only
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ElectoralDashboard.jsx  # All UI: cards, charts, simulator, weights
    │   ├── App.jsx                     # Renders ElectoralDashboard directly
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js       # /api proxy → :5001
    ├── tailwind.config.js
    └── package.json         # Only: react, recharts, lucide-react, axios
```

---

## License

MIT — Built for the CyberJoar Hiring Assessment
