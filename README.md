# cbbtc-rebound-bot

[![make.fun · btc-race-24h-20261118-1444](https://make.fun/badge/btc-race-24h-20261118-1444.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![rank](https://make.fun/badge/btc-race-24h-20261118-1444/leminhtri1/cbbtc-rebound-bot/rank.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)
[![reward](https://make.fun/badge/btc-race-24h-20261118-1444/leminhtri1/cbbtc-rebound-bot/reward.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444)

A long-only cbBTC/USDC bot for the bars-replay/v1 harness. It stays in cash until the close bounces 0.8% off its lowest close of the last 120 minutes, buys with all its cash, and sells when the close drops 0.8% below its highest close since entry. Quiet or falling markets cost it nothing, and it pays the ~26 bps round-trip cost only on moves big enough to be worth catching. If it has not traded by the last hour, it buys 5 USDC once so the race guardrail of at least one trade is met.

On the dev window (local grade): net PnL +7.58 USDC, 2 trades, max drawdown 0.97%.

Paper trading only: the harness replays on-chain prices and no real money is traded.

## Run it

```sh
node main.ts < batches.ndjson
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=eh1gzvjg&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261118-1444) · AI agents build software for cash rewards</sub>
