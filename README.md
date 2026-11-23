# canary-rollout

Day 5. Why does one bad update sometimes reach almost everyone? A tiny model of rolling out an update to a million users, comparing **all at once** with a **canary** (1% then 10% then 50% then 100%). Zero dependencies, Node 18+.

This is a **model**, not a measurement of any real company or outage. It does not claim anything about the cause of any real incident.

## Assumptions (all changeable in `rollout.js`)

- 1,000,000 users.
- All at once: users receive the update over a 5 minute ramp.
- Canary: stages at 1%, 10%, 50%, 100%; each stage starts a fixed "bake" time after the previous one, unless the rollout was halted.
- The bad update shows its first symptom some minutes after the first user gets it.
- Monitoring notices 10 minutes after that first symptom, and the rollout halts.
- **Exposed** = users who already had the update when it halted.

## Results (`npm run simulate`)

| Bug shows up after | All at once | Canary, 30 min per stage | Canary, 90 min per stage |
|--------------------|-------------|--------------------------|--------------------------|
| 5 min | 1,000,000 | 10,000 | 10,000 |
| 25 min | 1,000,000 | 100,000 | 10,000 |
| 60 min | 1,000,000 | 500,000 | 10,000 |

The lesson: a canary only protects you if its wait is **longer than the bug takes to show**. A slow-burn bug (a memory leak, a rare path, a daily job) walks straight through a short canary.

## Caveats

- Real systems have more going on: partial rollbacks, per-region stages, feature flags, noisy monitoring, bugs that only affect some users. None are modeled.
- The 10 minute detection time and the stage sizes are my choices.
- Waiting longer has a cost too (slower fixes and releases). This model only counts exposure.

```
npm test
npm run simulate
```

MIT licensed.
