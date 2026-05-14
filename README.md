# PulseMatrix — Predictive Electoral Analytics Platform

PulseMatrix is a full-stack predictive analytics platform that models electoral outcomes across multiple candidates using weighted intelligence factors, server-side probability computation, and interactive what-if simulation.

The platform combines analytical dashboards, live scenario recomputation, and visualization-driven decision modelling through a custom probability engine powered by temperature-scaled Softmax scoring.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.x-FF6384?style=for-the-badge)](https://recharts.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## Features

- Multi-candidate weighted probability modelling
- Server-side temperature-scaled Softmax computation engine
- Real-time scenario simulation via live API recomputation
- Interactive radar and comparative analytics visualizations
- Constituency-weight configuration system with validation logic
- Strategic factor-gap analysis across competing candidates
- Live probability delta recalculation through simulator controls
- Responsive tactical dashboard interface with analytical dark UI

---

## Candidate Intelligence Matrix

| Factor | Weight | Description |
|---|---|---|
| Incumbency Effect | 15% | Office advantage or anti-incumbency drag |
| Party Strength | 25% | Cadre network and brand recognition |
| Past Work Record | 20% | Legislative and development activity |
| Personal Base | 15% | Loyal vote bank independent of party |
| Demographic Base | 10% | Community-consolidated voter alignment |
| Digital Sentiment | 15% | Social media and news sentiment score |

---

## Probability Engine

### Weighted Score Computation

```math
rawScore(c) = \sum(score_i \times weight_i)
```

### Temperature-Scaled Softmax

```math
P(c_i) = \frac{e^{rawScore_i / T}}{\sum e^{rawScore_j / T}}
```

Where:

- `T = 0.8`
- all candidate probabilities normalize to 100%
- higher weighted factor alignment increases overall probability of win

### Turnout Bonus Logic

Candidates with:

```text
personalBase ≥ 80
```

receive a strategic turnout bonus adjustment before final normalization.

---

## Live Simulation Engine

The simulation engine supports live recomputation of Probability of Win values through API-driven score overrides.

Example:

```http
GET /api/elections/simulate?digitalSentiment_1=95&partyStrength_0=40
```

The backend recalculates:

- weighted scores
- Softmax probabilities
- radar visualization data
- comparative deltas

in real time.

---

## Visual Analytics

### Candidate Cards
Animated Probability-of-Win gauges with factor breakdowns and candidate metadata.

### Radar Analytics
Overlay comparison of all six intelligence factors across candidates.

### Comparative Probability Charts
Side-by-side probability visualization with custom tooltip insights.

### Strategic Gap Analysis
Per-factor leader identification with visual comparative indicators.

### Weight Configuration Panel
Interactive constituency-weight visualization with sum validation.

---

## System Flow

```text
Client Dashboard
        ↓
Express API Layer
        ↓
Probability Engine
        ↓
Softmax Computation
        ↓
Radar & Comparative Analytics
```

---

## Live Deployment

🔴 LIVE DEMO:  
https://cyberjoar-electoral-matrix.vercel.app/

> Backend API is hosted on Render free tier and may require initial cold-start spin-up time.

---

## Local Setup

### Prerequisites

- Node.js v18+
- npm v9+

---

## Backend

```bash
cd backend

npm install

npm run dev
```

Runs on:

```text
http://localhost:5001
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```text
http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status |
| `GET` | `/api/elections` | Candidate matrix + computed probabilities |
| `GET` | `/api/elections/simulate` | Live scenario recomputation |

---

## Tech Stack

### Frontend
- React
- Vite
- TailwindCSS
- Recharts

### Backend
- Node.js
- Express

### Visualization & Analytics
- Radar Charts
- Comparative Probability Graphs
- Simulation Engine
- Weighted Modelling

---

## Project Structure

```text
pulsematrix/
├── backend/
│   ├── routes/
│   │   └── elections.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Key Engineering Concepts

- weighted analytical modelling
- server-side probability computation
- temperature-scaled Softmax normalization
- real-time API-driven simulation
- interactive data visualization
- tactical analytics dashboards
- scalable frontend state orchestration

---

## Summary

PulseMatrix demonstrates:

- analytical dashboard engineering
- simulation-driven full stack architecture
- probability modelling systems
- visualization-oriented frontend engineering
- API-driven recomputation workflows
- interactive decision-support interfaces
