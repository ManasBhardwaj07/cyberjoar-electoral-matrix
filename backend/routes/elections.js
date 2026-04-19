const express = require("express");
const router  = express.Router();

// ── Candidate Data ──────────────────────────────────────────────────────────
const CANDIDATES = [
  {
    id: "candidate-alpha",
    name: "Arjun Verma",
    party: "National Alliance Party",
    partyShort: "NAP",
    role: "Incumbent",
    constituency: "Chandigarh Central",
    color: "#00d4ff",
    avatar: "AV",
    profile: {
      age: 58,
      termsServed: 2,
      fundUtilization: "₹ 42 Cr of ₹ 50 Cr",
      keyProject: "Chandigarh Metro Phase II",
      socialMedia: "@ArjunVermaNAP",
    },
    scores: {
      incumbencyEffect: 38,
      partyStrength:    82,
      pastWork:         71,
      personalBase:     65,
      demographicBase:  55,
      digitalSentiment: 34,
    },
  },
  {
    id: "candidate-beta",
    name: "Priya Sehgal",
    party: "Progressive Regional Front",
    partyShort: "PRF",
    role: "Challenger",
    constituency: "Chandigarh Central",
    color: "#a78bfa",
    avatar: "PS",
    profile: {
      age: 41,
      termsServed: 0,
      fundUtilization: "N/A (First Contest)",
      keyProject: "Free Skill India Drive (NGO)",
      socialMedia: "@PriyaSehgalPRF",
    },
    scores: {
      incumbencyEffect: 72,
      partyStrength:    68,
      pastWork:         79,
      personalBase:     84,
      demographicBase:  78,
      digitalSentiment: 91,
    },
  },
  {
    id: "candidate-gamma",
    name: "Hardeep Gill",
    party: "Aam Sangharsh Party",
    partyShort: "ASP",
    role: "Independent",
    constituency: "Chandigarh Central",
    color: "#fb923c",
    avatar: "HG",
    profile: {
      age: 49,
      termsServed: 1,
      fundUtilization: "₹ 8 Cr of ₹ 12 Cr",
      keyProject: "Rural Water Access Campaign",
      socialMedia: "@HardeepGillASP",
    },
    scores: {
      incumbencyEffect: 50,
      partyStrength:    22,
      pastWork:         44,
      personalBase:     61,
      demographicBase:  38,
      digitalSentiment: 29,
    },
  },
];

// ── Weight Configuration ────────────────────────────────────────────────────
// Constituency-tuned for Chandigarh Central (semi-urban, high digital literacy).
// All weights must sum to exactly 1.00.
const WEIGHTS = {
  incumbencyEffect: 0.15,   // 15%
  partyStrength:    0.25,   // 25%
  pastWork:         0.20,   // 20%
  personalBase:     0.15,   // 15%
  demographicBase:  0.10,   // 10%
  digitalSentiment: 0.15,   // 15%
};

// ── Factor Metadata (returned to frontend for labels and descriptions) ───────
const FACTOR_META = {
  incumbencyEffect:  { label: "Incumbency Effect",  weight: WEIGHTS.incumbencyEffect, description: "Reflects whether holding office helps or hurts the candidate given current sentiment." },
  partyStrength:     { label: "Party Strength",     weight: WEIGHTS.partyStrength,    description: "Organizational muscle, cadre network, and national or regional brand recognition." },
  pastWork:          { label: "Past Work Record",   weight: WEIGHTS.pastWork,         description: "Verified development projects, fund utilization, and legislative activity on record." },
  personalBase:      { label: "Personal Base",      weight: WEIGHTS.personalBase,     description: "Loyal vote bank that follows the candidate independent of party affiliation." },
  demographicBase:   { label: "Demographic Base",   weight: WEIGHTS.demographicBase,  description: "Religious and community-based consolidated vote share within the constituency." },
  digitalSentiment:  { label: "Digital Sentiment",  weight: WEIGHTS.digitalSentiment, description: "Net positive sentiment score derived from OSINT monitoring of social media and news." },
};

// ── Probability of Win Algorithm ────────────────────────────────────────────
/**
 * Three-step pipeline:
 *
 * Step 1 — Weighted Score
 *   rawScore(c) = Σ ( score[factor] × weight[factor] )
 *
 * Step 2 — Temperature-Scaled Softmax (T = 0.8)
 *   Sharpens the distribution so scores aren't a flat 33/33/33 split.
 *   exp_i  = e ^ ( rawScore_i / T )
 *   PoW(i) = exp_i / Σ exp_j   → zero-sum across all candidates
 *
 * Step 3 — Turnout Sensitivity Bonus
 *   Candidates with personalBase ≥ 80 receive a +4% mobilisation bonus.
 *   Bonus pool redistributed proportionally from other candidates.
 *   Final normalisation guarantees Σ PoW = 100% exactly.
 */
function computePoW(candidates) {
  // Step 1 — weighted raw scores
  const withRaw = candidates.map((c) => {
    const raw = Object.entries(WEIGHTS).reduce(
      (sum, [factor, weight]) => sum + (c.scores[factor] || 0) * weight,
      0
    );
    return { ...c, rawScore: parseFloat(raw.toFixed(4)) };
  });

  // Step 2 — Softmax with T = 0.8
  const T        = 0.8;
  const expScores = withRaw.map((c) => Math.exp(c.rawScore / T));
  const expSum    = expScores.reduce((a, b) => a + b, 0);
  const withSoftmax = withRaw.map((c, i) => ({
    ...c,
    softmaxScore: expScores[i] / expSum,
  }));

  // Step 3 — Turnout bonus
  const TURNOUT_BONUS = 0.04;
  let totalBonus = 0;
  const withBonus = withSoftmax.map((c) => {
    const bonus = c.scores.personalBase >= 80 ? TURNOUT_BONUS : 0;
    totalBonus += bonus;
    return { ...c, turnoutBonus: bonus };
  });

  const withAdjusted = withBonus.map((c) => {
    const adjusted =
      c.softmaxScore +
      c.turnoutBonus -
      (totalBonus - c.turnoutBonus) *
        (c.softmaxScore / (1 - c.softmaxScore + 0.0001)) *
        0.01;
    return {
      ...c,
      probabilityOfWin: parseFloat((Math.max(adjusted, 0.01) * 100).toFixed(2)),
    };
  });

  // Final normalisation — guarantee Σ = 100
  const powSum = withAdjusted.reduce((s, c) => s + c.probabilityOfWin, 0);
  return withAdjusted.map((c) => ({
    ...c,
    probabilityOfWin: parseFloat(((c.probabilityOfWin / powSum) * 100).toFixed(2)),
  }));
}

// ── Data Shapers ─────────────────────────────────────────────────────────────
function buildRadarData(processed) {
  return Object.keys(WEIGHTS).map((factor) => {
    const row = { factor: FACTOR_META[factor].label, fullMark: 100 };
    processed.forEach((c) => { row[c.name] = c.scores[factor]; });
    return row;
  });
}

function buildBarData(processed) {
  return processed.map((c) => ({
    name: c.name,
    party: c.partyShort,
    role: c.role,
    probabilityOfWin: c.probabilityOfWin,
    color: c.color,
  }));
}

function shapeCandidates(processed) {
  return processed.map((c) => ({
    id: c.id,
    name: c.name,
    party: c.party,
    partyShort: c.partyShort,
    role: c.role,
    constituency: c.constituency,
    color: c.color,
    avatar: c.avatar,
    profile: c.profile,
    scores: c.scores,
    rawScore: c.rawScore,
    probabilityOfWin: c.probabilityOfWin,
  }));
}

// ── GET /api/elections ────────────────────────────────────────────────────────
router.get("/", (_req, res) => {
  const processed = computePoW(CANDIDATES);
  res.json({
    success: true,
    constituency: {
      name: "Chandigarh Central",
      state: "Punjab",
      totalVoters: 312450,
      historicalTurnout: "68.4%",
      lastMargin: 4821,
      classification: "Swing Seat",
    },
    weights:    WEIGHTS,
    factorMeta: FACTOR_META,
    candidates: shapeCandidates(processed),
    radarData:  buildRadarData(processed),
    barData:    buildBarData(processed),
    generatedAt: new Date().toISOString(),
  });
});

// ── GET /api/elections/simulate ───────────────────────────────────────────────
// Query params: factor_candidateIndex=value
// e.g. ?digitalSentiment_1=95&partyStrength_0=40
router.get("/simulate", (req, res) => {
  const simCandidates = CANDIDATES.map((c, idx) => {
    const overrideScores = { ...c.scores };
    Object.keys(c.scores).forEach((factor) => {
      const key = `${factor}_${idx}`;
      if (req.query[key] !== undefined) {
        overrideScores[factor] = Math.max(0, Math.min(100, parseInt(req.query[key], 10)));
      }
    });
    return { ...c, scores: overrideScores };
  });

  const processed = computePoW(simCandidates);
  res.json({
    success: true,
    candidates: processed.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      scores: c.scores,
      probabilityOfWin: c.probabilityOfWin,
    })),
    radarData: buildRadarData(processed),
    barData:   buildBarData(processed),
  });
});

module.exports = router;
