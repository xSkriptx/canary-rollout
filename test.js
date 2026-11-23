const assert = require('assert');
const { allAtOnce, canary, exposed } = require('./rollout');

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };
const U = 1_000_000;

t('all at once: a fast bug still reaches most of the ramp', () => {
  assert.strictEqual(exposed(allAtOnce(), { symptomMin: 5, detectMin: 10 }), 1_000_000);   // halt at minute 15, ramp is 5 min
});

t('all at once: with no detection delay and a slow ramp, only part is exposed', () => {
  assert.strictEqual(exposed(allAtOnce({ rampMin: 20 }), { symptomMin: 0, detectMin: 10 }), 500_000);
});

t('canary: a fast bug is stopped at 1%', () => {
  assert.strictEqual(exposed(canary({ bakeMin: 30 }), { symptomMin: 5, detectMin: 10 }), 10_000);
});

t('canary: a bug slower than the first wait gets past 1%', () => {
  assert.strictEqual(exposed(canary({ bakeMin: 30 }), { symptomMin: 25, detectMin: 10 }), 100_000);   // halt 35, stage 2 started at 30
});

t('canary: a slow burn reaches half the users', () => {
  assert.strictEqual(exposed(canary({ bakeMin: 30 }), { symptomMin: 60, detectMin: 10 }), 500_000);  // halt 70, stage 3 started at 60
});

t('canary: waiting longer than the bug takes to show keeps it at 1%', () => {
  assert.strictEqual(exposed(canary({ bakeMin: 90 }), { symptomMin: 60, detectMin: 10 }), 10_000);   // halt 70 < 90
});

t('canary never exposes more than all-at-once', () => {
  for (const s of [0, 5, 25, 60, 200]) for (const b of [10, 30, 90]) {
    assert.ok(exposed(canary({ bakeMin: b }), { symptomMin: s }) <= exposed(allAtOnce(), { symptomMin: s }));
  }
});

console.log(`\n${n} tests passed`);
