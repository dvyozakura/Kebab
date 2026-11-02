import { CARDS, SHOPS, TIERS, WALLET } from './data.js';
import {
  makeRng, newRun, openShop, offer, useCard, walk, comeBack, leave, buy, isRunOver, summary, realFloor,
} from './game.js';
import { doner, face, kebab, scene, signBoard } from './art.js';
import { isMuted, sfx, startMusic, stopMusic, toggleMute, unlock } from './audio.js';

const $ = (id) => document.getElementById(id);
const yen = (n) => '¥' + n.toLocaleString('ja-JP');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, calm ? Math.min(ms, 350) : ms));

const params = new URLSearchParams(location.search);
const seed = params.get('seed');
const BEST_KEY = 'negire-best';

let run = null;
let shop = null;
let hand = [];
let busy = false;
let warned = false;
let shareUrl = '';
let shareText = '';

// スマホはOSの共有シートを使う。X本体の投稿画面へ直接渡せるので、
// リンク経由でアプリ内ブラウザが開く問題を避けられる。
function useShareSheet() {
  return matchMedia('(pointer: coarse)').matches && typeof navigator.share === 'function';
}

function show(id) {
  ['title', 'game', 'receipt'].forEach((s) => { $(s).hidden = s !== id; });
  scrollTo(0, 0);
}

function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
}

function saveBest(v) {
  try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* 保存できなくても遊べる */ }
}

function renderBest() {
  const best = readBest();
  $('bestLine').hidden = !best;
  $('bestLine').textContent = `これまでの最高: ${yen(best)} 値切り`;
}

function setFace(expr) {
  const g = $('face');
  if (g) g.innerHTML = face(expr, shop.def.look);
}

function keeperSay(text, expr, chip = null) {
  $('bubble').className = 'bubble pop';
  void $('bubble').offsetWidth;
  $('bubble').classList.add('in');
  $('who').textContent = `${shop.def.name}（${shop.def.title}）`;
  $('line').textContent = text;
  $('chip').hidden = !chip;
  if (chip) {
    $('chip').textContent = TIERS[chip].label;
    $('chip').dataset.tier = chip;
  }
  if (expr) setFace(expr);
}

async function playerSay(text, ms = 800) {
  $('bubble').className = 'bubble me';
  $('who').textContent = 'あなた';
  $('chip').hidden = true;
  $('line').textContent = text;
  await wait(ms);
}

function renderPips() {
  $('pips').innerHTML = SHOPS.map((d, i) => {
    const r = run.results[i];
    const state = r ? (r.bought ? 'got' : 'lost') : i === run.idx ? 'now' : '';
    return `<li class="${state}" title="${d.item}">${r ? (r.bought ? '済' : '×') : i + 1}</li>`;
  }).join('');
}

function renderCards() {
  $('cards').innerHTML = hand.map((id) => {
    const c = CARDS[id];
    const usedKey = id in shop.used;
    const res = usedKey ? (shop.used[id] ? '<em class="res ok">効いた</em>' : '<em class="res ng">空振り</em>') : '';
    return `<button class="card" data-id="${id}" ${usedKey || busy ? 'disabled' : ''}>
      <b>${c.name}</b><small>${c.desc}</small>${res}</button>`;
  }).join('');
}

function renderSign() {
  const sign = $('sign');
  if (sign) sign.innerHTML = signBoard(shop.prices, shop.probe);
}

function sliderBounds() {
  const min = Math.ceil(shop.def.list * 0.03) * 10;
  const max = Math.min(shop.ask - 10, run.wallet);
  return { min, max };
}

function renderControls() {
  const { min, max } = sliderBounds();
  const s = $('slider');
  const canOffer = max >= min;
  s.min = min;
  s.max = Math.max(min, max);
  s.disabled = busy || !canOffer;
  if (Number(s.value) > max) s.value = max;
  if (Number(s.value) < min) s.value = min;
  document.querySelectorAll('.nudge').forEach((b) => { b.disabled = busy || !canOffer; });
  $('offerBtn').disabled = busy || !canOffer;
  $('offerBtn').textContent = `${yen(Number(s.value))}でどう？`;
  $('walkBtn').disabled = busy;
  const afford = shop.ask <= run.wallet;
  $('buyBtn').disabled = busy || !afford;
  $('buyBtn').textContent = afford ? `${yen(shop.ask)}で買う` : '予算が足りない';
  $('walkBtn').textContent = shop.walks ? 'もう一度帰るふり' : '帰るふりをする';
}

function renderHud() {
  $('wallet').textContent = yen(run.wallet);
  $('rope').style.width = `${shop.patience}%`;
  $('rope').parentElement.classList.toggle('thin', shop.patience < 35);
  $('ropeMeter').setAttribute('aria-valuenow', shop.patience);
}

function render() {
  renderHud();
  renderPips();
  renderCards();
  renderControls();
}

function setBusy(v) {
  busy = v;
  renderCards();
  renderControls();
}

function enterShop() {
  shop = openShop(run);
  hand = [...shop.hand];
  warned = false;
  $('scene').innerHTML = scene(shop.def);
  $('scene').style.background = shop.def.color;
  renderSign();
  $('endOverlay').hidden = true;
  $('backOverlay').hidden = true;
  render();
  $('slider').value = Math.round(shop.def.list * 0.05) * 10;
  renderControls();
  keeperSay(shop.def.lines.greet, 'neutral');
  $('offerBtn').focus({ preventScroll: true });
}

function startRun() {
  unlock();
  sfx('offer');
  startMusic();
  run = newRun(seed ? makeRng(Number(seed)) : Math.random);
  show('game');
  enterShop();
}

function afterPrice(before) {
  if (shop.prices.length !== before) {
    renderSign();
    sfx('scratch');
  }
  renderHud();
}

function warnIfNeeded(line, expr, chip) {
  if (shop.patience < 30 && !warned) {
    warned = true;
    keeperSay(shop.def.lines.warn, 'annoyed', chip);
  } else {
    keeperSay(line, expr, chip);
  }
}

function showEnd(result) {
  const { def } = shop;
  const stamp = $('stamp');
  const deal = result.type === 'deal';
  stamp.className = `stamp ${deal ? '' : 'bad'}`;
  stamp.textContent = deal ? '成立' : result.type === 'kicked' ? '出禁' : '撤退';
  $('resultArt').innerHTML = deal ? kebab(shop.noNegi) : '';
  $('resultTitle').textContent = deal ? `${shop.friend === '自分' ? '自分' : shop.friend}の${def.item}` : `${shop.friend}の分は買えなかった`;
  if (deal) {
    const off = def.list - result.price;
    $('resultPrice').innerHTML = `<s>${yen(def.list)}</s> ${yen(result.price)} <span>${yen(off)}値切った</span>`;
    const left = result.margin === 0 ? '底値ぴったり。これ以上は下がらなかった。' : `この時の底値は${yen(result.floor)}。あと${yen(result.margin)}いけた。`;
    $('resultNote').textContent = left + (shop.noNegi ? ' ネギは抜いてある。' : '');
  } else {
    $('resultPrice').textContent = '';
    $('resultNote').textContent = `この時の底値は${yen(realFloor(shop))}だった。`;
  }
  $('nextBtn').textContent = isRunOver(run) ? 'レシートを見る' : `次の屋台へ（${SHOPS[run.idx].name}）`;
  $('endOverlay').hidden = false;
  stamp.classList.remove('hit');
  void stamp.offsetWidth;
  stamp.classList.add('hit');
  sfx('stamp');
  if (deal) setTimeout(() => sfx('coin'), 260);
  else setTimeout(() => sfx('fail'), 260);
  $('nextBtn').focus({ preventScroll: true });
}

async function finishShop(result) {
  const l = shop.def.lines;
  render();
  if (result.type === 'deal') {
    const tight = result.margin <= shop.def.list * 0.04;
    keeperSay(tight ? l.tight : l.easy, tight ? 'sweat' : 'smug');
    await wait(1300);
  } else if (result.type === 'kicked') {
    sfx('no');
    keeperSay(l.kick, 'angry');
    document.body.classList.add('shake');
    await wait(1300);
    document.body.classList.remove('shake');
  }
  showEnd(result);
}

async function doOffer() {
  if (busy) return;
  const price = Number($('slider').value);
  setBusy(true);
  sfx('offer');
  await playerSay(`${yen(price)}でどうですか？`, 620);
  const before = shop.prices.length;
  const r = offer(run, shop, price);
  if (r.type === 'refuse') {
    const l = shop.def.lines;
    const t = TIERS[r.tier];
    sfx('no');
    if (r.lowered) warnIfNeeded(l.lowered, 'angry', r.tier);
    else warnIfNeeded(l[r.tier], t.face, r.tier);
    afterPrice(before);
    // 次の金額の初期値。反応が遠いほど大きく上げておく（自分で動かしてもよい）
    const step = { insult: 0.12, low: 0.07, near: 0.03, close: 0.02 }[r.tier] * shop.def.list;
    $('slider').value = Math.min(Math.round((price + step) / 10) * 10, shop.ask - 10);
    await wait(250);
    setBusy(false);
  } else {
    await finishShop(r);
  }
}

async function doCard(id) {
  if (busy) return;
  setBusy(true);
  sfx('tick');
  await playerSay(CARDS[id].say, 1250);
  const before = shop.prices.length;
  const r = useCard(run, shop, id);
  const l = shop.def.lines;
  if (r.type === 'kicked') {
    await finishShop(r);
    return;
  }
  sfx(r.hit ? 'hit' : 'miss');
  if (id === 'chat') keeperSay(r.hint, 'happy');
  else if (id === 'probe') keeperSay('……そんなこと聞いてどうするの。', 'annoyed');
  else if (id === 'negi') keeperSay('ネギ抜きね。そのぶん引いとくよ。', 'neutral');
  else keeperSay(r.hit ? l.hit : l.miss, r.hit ? 'sweat' : 'annoyed');
  renderSign();
  afterPrice(before);
  await wait(250);
  setBusy(false);
}

function walkStage(step) {
  const stage = $('stage');
  stage.classList.remove('w1', 'w2', 'w3');
  if (step) stage.classList.add(`w${step}`);
  $('walkCount').textContent = step ? `${step}歩` : '';
  $('walkCount').className = step ? 'walk-count on' : 'walk-count';
}

async function doWalk() {
  if (busy) return;
  setBusy(true);
  await playerSay('……じゃあ、いいです。', 900);
  const before = shop.prices.length;
  const r = walk(run, shop);
  stopMusic();
  $('bubble').className = 'bubble gone';
  setFace('neutral');
  document.body.classList.add('walking');
  for (let step = 1; step <= 3; step++) {
    walkStage(step);
    sfx('step');
    await wait(1000);
    if (r.called && r.step === step) break;
  }
  document.body.classList.remove('walking');
  walkStage(0);
  startMusic();
  if (r.called) {
    sfx('shout');
    keeperSay(shop.def.lines.call, 'shock');
    afterPrice(before);
    if (shop.prices.length !== before) $('slider').value = Math.min(Number($('slider').value), shop.ask - 10);
    await wait(250);
    setBusy(false);
    return;
  }
  sfx('no');
  const up = Math.min(shop.def.list, shop.ask + 50);
  $('backText').textContent = `店主はこちらを見ていない。戻れば気まずいうえに値段は${yen(up)}になり、緒も削れる。帰れば${shop.friend}の分はなし。`;
  $('backBtn').textContent = '気まずいけど戻る';
  $('leaveBtn').textContent = `本当に帰る（${shop.friend}の分を諦める）`;
  $('backOverlay').hidden = false;
  $('backBtn').focus({ preventScroll: true });
}

async function doBack() {
  $('backOverlay').hidden = true;
  const before = shop.prices.length;
  const r = comeBack(run, shop);
  if (r.type === 'kicked') {
    await finishShop(r);
    return;
  }
  keeperSay(shop.def.lines.back, 'smug');
  afterPrice(before);
  setBusy(false);
}

async function doLeave() {
  $('backOverlay').hidden = true;
  const r = leave(run, shop);
  render();
  showEnd(r);
}

async function doBuy() {
  if (busy) return;
  setBusy(true);
  sfx('offer');
  await playerSay(`${yen(shop.ask)}で買います。`, 620);
  await finishShop(buy(run, shop));
}

function showReceipt() {
  stopMusic();
  const z = summary(run);
  const now = new Date();
  $('rDate').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 夜`;
  $('rLines').innerHTML = run.results.map((r) => `
    <li><span>${r.friend}: ${r.item}${r.noNegi ? '（ネギ抜き）' : ''}</span>
    ${r.bought ? `<span><s>${yen(r.list)}</s> ${yen(r.paid)}</span>` : `<span class="lost">${r.reason === 'kicked' ? '出禁' : '撤退'}</span>`}</li>`).join('');
  $('rList').textContent = yen(z.listTotal);
  $('rPaid').textContent = yen(z.paid);
  $('rSaved').textContent = yen(z.saved);
  $('rLeft').textContent = yen(z.wallet);
  const title = z.clear ? z.rank.name : `${z.misses}人が空腹`;
  $('rRank').textContent = title;
  $('rNote').textContent = z.clear ? z.rank.note : '全員に配れなかったので称号はお預け。公園の空気が重い。';
  if (z.clear && z.saved > readBest()) saveBest(z.saved);
  // 称号ごとの共有ページを貼ると、Xではそのカード画像付きで表示される
  shareUrl = new URL(`share/${z.clear ? z.rank.slug : 'hungry'}.html`, location.href.split(/[?#]/)[0]).href;
  shareText = z.clear
    ? `ネギれ！ケバブで5人分を${yen(z.paid)}で買って、${yen(z.saved)}値切った。称号「${title}」`
    : `ネギれ！ケバブ、${z.bought}人分しか買えなかった……`;
  $('shareBtn').href = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  $('shareBtn').textContent = useShareSheet() ? '結果をシェア' : '結果をXに投稿';
  show('receipt');
  sfx(z.clear ? 'coin' : 'fail');
}

// ---- 入力 ----
$('titleDoner').innerHTML = `<svg viewBox="-110 -30 220 230" xmlns="http://www.w3.org/2000/svg">${doner('title')}</svg>`;
renderBest();
$('muteBtn').textContent = isMuted() ? '音なし' : '音あり';

$('startBtn').addEventListener('click', startRun);
$('againBtn').addEventListener('click', () => { renderBest(); startRun(); });
$('offerBtn').addEventListener('click', doOffer);
$('walkBtn').addEventListener('click', doWalk);
$('buyBtn').addEventListener('click', doBuy);
$('backBtn').addEventListener('click', doBack);
$('leaveBtn').addEventListener('click', doLeave);
$('nextBtn').addEventListener('click', () => {
  busy = false;
  if (isRunOver(run)) showReceipt();
  else enterShop();
});
$('slider').addEventListener('input', renderControls);
document.querySelectorAll('.nudge').forEach((b) => b.addEventListener('click', () => {
  const s = $('slider');
  s.value = Number(s.value) + Number(b.dataset.d);
  sfx('tick');
  renderControls();
}));
$('cards').addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card && !card.disabled) doCard(card.dataset.id);
});
$('shareBtn').addEventListener('click', async (e) => {
  if (!useShareSheet()) return; // PCは通常のリンクとして投稿画面を開く
  e.preventDefault();
  try {
    await navigator.share({ text: `${shareText}\n${shareUrl}` });
  } catch (err) {
    if (err.name !== 'AbortError') window.open($('shareBtn').href, '_blank', 'noopener');
  }
});
$('muteBtn').addEventListener('click', () => {
  const m = toggleMute();
  $('muteBtn').textContent = m ? '音なし' : '音あり';
  $('muteBtn').setAttribute('aria-pressed', String(m));
});
