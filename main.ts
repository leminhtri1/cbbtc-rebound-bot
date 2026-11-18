// cbBTC rebound-trend bot for make.fun's "Race a BTC trading bot live for 24 hours".
//
// Long only, one asset, at most one round trip in flight:
//   - Entry: the close is at least ENTRY_BOUNCE above the lowest close of the last LOOKBACK bars
//     (a clear bounce off a recent low), and the bot holds nothing. It buys with all its cash.
//   - Exit: the close falls TRAIL below the highest close seen since the entry (a trailing stop).
//   - Fallback: the guardrails ask for at least one trade on the race window. If the bot has not
//     bought by FALLBACK_BAR, it buys FALLBACK_USDC once; the replay sells it at the last close.
//
// The bot stays in cash through quiet or falling markets, so it pays fees (~26 bps a round trip)
// only when a move is large enough to be worth catching. Prices are compared as bigints, so the
// same bars always give the same orders.

import { runBars, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const LOOKBACK = 120; // bars (minutes) for the recent low
const ENTRY_BOUNCE_BPS = 80n; // 0.8% off the low
const TRAIL_BPS = 80n; // 0.8% trailing stop
const MAX_SLIPPAGE_BPS = 100;
const FALLBACK_BAR = 1380; // last hour of a 1,440-bar window
const FALLBACK_USDC = 5_000_000n; // 5 USDC
const BPS = 10_000n;

const closes: bigint[] = [];
let peak = 0n;
let traded = false;
let bars = 0;

await runBars({
  onBatch(state, batch) {
    for (const fill of batch.fills) if (fill.status === 'filled' && !fill.client_id.startsWith('_')) traded = true;

    const bar = batch.bars.find((b) => b.symbol === SYMBOL);
    if (bar === undefined) return [];
    bars++;
    const c = BigInt(bar.c);
    closes.push(c);
    if (closes.length > LOOKBACK + 1) closes.shift();
    if (state.warmingUp) return [];

    const held = state.positions.get(SYMBOL);
    if (held !== undefined) {
      if (c > peak) peak = c;
      if (c * BPS < peak * (BPS - TRAIL_BPS)) {
        const sell: SellInput = { side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
        return [sell];
      }
      return [];
    }

    const minNotional = BigInt(state.hello.fees.min_notional_quote_units);
    if (closes.length > LOOKBACK) {
      let low = closes[0];
      for (const x of closes) if (x < low) low = x;
      if (c * BPS >= low * (BPS + ENTRY_BOUNCE_BPS) && state.cash >= minNotional) {
        peak = c;
        const buy: BuyInput = { side: 'buy', symbol: SYMBOL, notional_quote_units: state.cash, max_slippage_bps: MAX_SLIPPAGE_BPS };
        return [buy];
      }
    }

    if (!traded && bars >= FALLBACK_BAR && state.cash >= FALLBACK_USDC) {
      peak = c; // a rejected fallback is sent again on the next bar
      const buy: BuyInput = { side: 'buy', symbol: SYMBOL, notional_quote_units: FALLBACK_USDC, max_slippage_bps: MAX_SLIPPAGE_BPS };
      return [buy];
    }
    return [];
  },
});
