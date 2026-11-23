const fs = require('fs');
const { USERS, allAtOnce, canary, exposed } = require('./rollout');

const DETECT_MIN = 10;
const SYMPTOMS = [5, 25, 60];                       // minutes until the bad update shows its first symptom
const plans = [allAtOnce(), canary({ bakeMin: 30 }), canary({ bakeMin: 90 })];

const rows = SYMPTOMS.map((s) => ({
  symptom_min: s,
  results: Object.fromEntries(plans.map((p) => [p.name, exposed(p, { symptomMin: s, detectMin: DETECT_MIN })])),
}));

fs.writeFileSync(__dirname + '/results.json', JSON.stringify({ users: USERS, detect_min: DETECT_MIN, rows }, null, 2));

const f = (n) => n.toLocaleString('en-US');
console.log(`users: ${f(USERS)}, monitoring notices ${DETECT_MIN} min after the first symptom\n`);
console.log('bug shows after'.padEnd(18) + plans.map((p) => p.name.padStart(26)).join(''));
for (const r of rows) console.log((r.symptom_min + ' min').padEnd(18) + plans.map((p) => f(r.results[p.name]).padStart(26)).join(''));
