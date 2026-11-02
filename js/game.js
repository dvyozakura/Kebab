// 値切りの計算だけを担当するモジュール。画面には触りません。
import { WALLET, CHANCE, CARDS, SAFE_CARDS, SHOPS, TIERS, TIER_ORDER, RANKS, FRIENDS } from './data.js';

export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const down10 = (v) => Math.floor(v / 10) * 10;
const near10 = (v) => Math.round(v / 10) * 10;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function newRun(rng = Math.random) {
  return { rng, wallet: WALLET, idx: 0, results: [] };
}

function shuffled(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function openShop(run) {
  const def = SHOPS[run.idx];
  const { rng } = run;
  const safe = shuffled(SAFE_CARDS, rng)[0];
  const rest = shuffled(Object.keys(CARDS).filter((c) => c !== safe), rng).slice(0, 2);
  return {
    def,
    friend: FRIENDS[run.idx],
    floor: near10(def.list * def.floor * (0.95 + rng() * 0.1)),
    ask: def.list,
    patience: 100,
    prices: [def.list],
    hand: shuffled([safe, ...rest], rng),
    used: {},
    hintIdx: 0,
    lastOffer: null,
    walks: 0,
    probe: null,
    noNegi: false,
    over: false,
  };
}

// 怒らせるほど本当の底値は上がる。安く叩き続ければ得、というわけではない。
export function realFloor(s) {
  return near10(s.floor * (1 + 0.15 * (1 - s.patience / 100)));
}

function setAsk(s, value) {
  const next = clamp(value, 0, s.ask);
  if (next !== s.ask) {
    s.ask = next;
    s.prices.push(next);
  }
}

function concede(run, s, amount) {
  const t = realFloor(s);
  if (s.ask <= t) return;
  const room = s.ask - t;
  const cut = Math.max(10, down10(room * amount));
  setAsk(s, Math.max(t, s.ask - cut));
}

function hurt(s, amount) {
  s.patience = clamp(s.patience - amount, 0, 100);
}

export function offer(run, s, price) {
  const { rng } = run;
  if (price >= s.ask) return buy(run, s);
  if (price > run.wallet) return null;
  const t = realFloor(s);
  const lowered = s.lastOffer !== null && price < s.lastOffer;
  if (price >= t) {
    const margin = price - t;
    close(run, s, price);
    return { type: 'deal', price, margin, floor: t };
  }
  const gap = (t - price) / t;
  const real = gap > 0.3 ? 'insult' : gap > 0.15 ? 'low' : gap > 0.06 ? 'near' : 'close';
  const shown = TIER_ORDER[Math.min(TIER_ORDER.indexOf(real) + s.def.bluff, 3)];
  const tier = TIERS[real];
  hurt(s, tier.dmg * s.def.temper + (lowered ? 15 : 0));
  s.lastOffer = price;
  if (s.patience <= 0) return kick(run, s);
  concede(run, s, s.def.give * tier.step * (0.8 + rng() * 0.4));
  return { type: 'refuse', tier: shown, lowered };
}

export function useCard(run, s, id) {
  const { rng } = run;
  s.hand = s.hand.filter((c) => c !== id);
  const before = s.patience;
  let hit = true;
  let hint = null;
  if (id === 'chat') {
    s.patience = clamp(s.patience + 18, 0, 100);
    hint = s.def.lines.hints[s.hintIdx % s.def.lines.hints.length];
    s.hintIdx++;
  } else if (id === 'probe') {
    hurt(s, 8);
    const t = realFloor(s);
    s.probe = [t - Math.floor(rng() * 7) * 10, t + (4 + Math.floor(rng() * 7)) * 10];
  } else if (id === 'negi') {
    s.floor -= 50;
    s.noNegi = true;
    setAsk(s, Math.max(realFloor(s), s.ask - 50));
  } else {
    const aff = s.def.aff[id] ?? 0;
    let chance = CHANCE[aff];
    if (id === 'empty' && run.wallet < 1500) chance = Math.min(0.95, chance + 0.3);
    hit = rng() < chance;
    const fx = {
      flatter: { drop: 0.03, gain: 20, loss: 12 },
      rival: { drop: 0.09, gain: 0, loss: 22 },
      bulk: { drop: 0.07, gain: 6, loss: 15 },
      tears: { drop: 0.08, gain: 0, loss: 15 },
      empty: { drop: 0.06, gain: 0, loss: 10 },
    }[id];
    if (hit) {
      s.floor = near10(s.floor * (1 - fx.drop));
      s.patience = clamp(s.patience + fx.gain, 0, 100);
      concede(run, s, 0.25);
    } else {
      hurt(s, fx.loss * s.def.temper);
    }
  }
  s.used[id] = hit;
  if (s.patience <= 0) return { ...kick(run, s), id, hit };
  return { type: 'card', id, hit, hint, delta: s.patience - before };
}

export function walk(run, s) {
  const { rng } = run;
  const t = realFloor(s);
  const noRoom = (s.ask - t) / s.def.list < 0.03;
  let chance = s.def.want * (0.3 + 0.7 * (s.patience / 100));
  if (s.walks > 0) chance *= 0.55;
  if (noRoom) chance *= 0.35;
  s.walks++;
  if (rng() >= chance) return { called: false };
  s.floor = near10(s.floor * 0.97);
  hurt(s, 10);
  const nt = realFloor(s);
  setAsk(s, Math.max(nt, near10(nt + (s.ask - nt) * 0.45)));
  return { called: true, step: 1 + Math.floor(rng() * 3) };
}

export function comeBack(run, s) {
  hurt(s, 25);
  s.ask = Math.min(s.def.list, s.ask + 50);
  s.prices.push(s.ask);
  if (s.patience <= 0) return kick(run, s);
  return { type: 'back' };
}

export function leave(run, s) {
  finish(run, s, { bought: false, reason: 'left' });
  return { type: 'left' };
}

export function buy(run, s) {
  const price = s.ask;
  if (price > run.wallet) return null;
  const t = realFloor(s);
  close(run, s, price);
  return { type: 'deal', price, margin: Math.max(0, price - t), floor: t, atAsk: true };
}

function close(run, s, price) {
  run.wallet -= price;
  finish(run, s, { bought: true, paid: price });
}

function kick(run, s) {
  finish(run, s, { bought: false, reason: 'kicked' });
  return { type: 'kicked' };
}

function finish(run, s, result) {
  s.over = true;
  run.results.push({
    item: s.def.item, shop: s.def.name, friend: s.friend, list: s.def.list, noNegi: s.noNegi, paid: 0, ...result,
  });
  run.idx++;
}

export const isRunOver = (run) => run.idx >= SHOPS.length;

export function summary(run) {
  const bought = run.results.filter((r) => r.bought);
  const misses = run.results.length - bought.length;
  const listTotal = SHOPS.reduce((n, s) => n + s.list, 0);
  const saved = bought.reduce((n, r) => n + r.list - r.paid, 0);
  const paid = bought.reduce((n, r) => n + r.paid, 0);
  const rate = saved / listTotal;
  const rank = RANKS.find((r) => rate >= r.min);
  // 誰かの分を買えなかった場合は称号なし。全員に配ってこそ。
  const clear = misses === 0;
  return { bought: bought.length, misses, saved, paid, rate, rank, clear, wallet: run.wallet, listTotal };
}
