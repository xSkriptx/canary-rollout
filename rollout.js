// A deliberately small model of rolling out a bad update. Time is in minutes. Everything here is an assumption you can change.
//
// A rollout is a list of stages. Each stage has the CUMULATIVE share of users who have the update, and the minute it starts.
// The bad update shows its first symptom `symptomMin` minutes after the first user gets it.
// Monitoring notices `detectMin` minutes after that first symptom, and the rollout halts.
// "Exposed" = users who already received the update when the rollout halts.

const USERS = 1_000_000;

// Everything at once: users receive it over a short ramp (default 5 minutes).
function allAtOnce({ rampMin = 5 } = {}) {
  return { name: 'all at once', ramp: rampMin, stages: [{ share: 1, start: 0 }] };
}

// Canary: 1% -> 10% -> 50% -> 100%, each stage starts `bakeMin` after the previous one (only if nothing halted it).
function canary({ bakeMin = 30, shares = [0.01, 0.1, 0.5, 1] } = {}) {
  return { name: `canary (${bakeMin} min per stage)`, ramp: 0, stages: shares.map((share, i) => ({ share, start: i * bakeMin })) };
}

function exposed(plan, { symptomMin, detectMin = 10, users = USERS }) {
  const halt = symptomMin + detectMin;                    // minute the rollout stops
  if (plan.ramp > 0) {                                    // linear ramp to the single stage
    const frac = Math.min(1, halt / plan.ramp);
    return Math.round(users * plan.stages[0].share * frac);
  }
  let share = 0;
  for (const s of plan.stages) if (s.start < halt) share = s.share;   // last stage that started before the halt
  return Math.round(users * share);
}

module.exports = { USERS, allAtOnce, canary, exposed };
