// 効果音と音楽はすべて Web Audio でその場で合成しています（音声ファイルなし）。
let ctx = null;
let master = null;
let muted = false;
let timer = null;
let nextT = 0;
let beat = 0;

try { muted = localStorage.getItem('negire-mute') === '1'; } catch { /* 保存できなくても遊べる */ }

export const isMuted = () => muted;

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.7;
  try { localStorage.setItem('negire-mute', muted ? '1' : '0'); } catch { /* 無視 */ }
  return muted;
}

function tone(freq, t, len, { type = 'sine', vol = 0.2, slide = 0 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + len);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + len);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + len + 0.02);
}

function noise(t, len, { vol = 0.2, freq = 1200, q = 1, type = 'bandpass' } = {}) {
  const n = Math.floor(ctx.sampleRate * len);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + len);
  s.connect(f).connect(g).connect(master);
  s.start(t);
}

const SFX = {
  tick(t) { tone(900, t, 0.04, { type: 'square', vol: 0.05 }); },
  offer(t) { tone(420, t, 0.08, { type: 'triangle', vol: 0.2 }); tone(630, t + 0.06, 0.1, { type: 'triangle', vol: 0.2 }); },
  scratch(t) { noise(t, 0.09, { vol: 0.25, freq: 2600 }); noise(t + 0.1, 0.13, { vol: 0.25, freq: 3200 }); },
  no(t) { tone(150, t, 0.22, { type: 'sawtooth', vol: 0.16, slide: -60 }); },
  hit(t) { [523, 659, 784].forEach((f, i) => tone(f, t + i * 0.07, 0.16, { type: 'triangle', vol: 0.2 })); },
  miss(t) { tone(330, t, 0.14, { type: 'square', vol: 0.09 }); tone(247, t + 0.14, 0.22, { type: 'square', vol: 0.09 }); },
  step(t) { noise(t, 0.1, { vol: 0.5, freq: 240, type: 'lowpass' }); tone(70, t, 0.1, { vol: 0.3 }); },
  shout(t) { tone(300, t, 0.2, { type: 'sawtooth', vol: 0.14, slide: 500 }); },
  stamp(t) { tone(95, t, 0.2, { vol: 0.6, slide: -50 }); noise(t, 0.07, { vol: 0.4, freq: 900 }); },
  coin(t) { [1318, 1760, 2093].forEach((f, i) => tone(f, t + i * 0.08, 0.28, { vol: 0.13 })); },
  fail(t) { [392, 330, 262, 196].forEach((f, i) => tone(f, t + i * 0.16, 0.28, { type: 'triangle', vol: 0.2 })); },
};

export function sfx(name) {
  if (!ctx) return;
  SFX[name]?.(ctx.currentTime + 0.005);
}

// 音楽: ヒジャーズ旋法の撥弦とマクスーム（8拍）の太鼓
const D = 146.83;
const SCALE = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16];
const MELODY = [4, -1, 5, 4, 3, -1, 2, 1, 2, 3, 4, -1, 2, -1, 0, -1, 7, -1, 6, 5, 4, -1, 3, 2, 1, 2, 3, 2, 0, -1, -1, -1];
const DRUM = 'D.T.TD.T'.replace(/\./g, '-');

function plan(t) {
  const m = MELODY[beat % MELODY.length];
  if (m >= 0) {
    const f = D * 2 ** (SCALE[m] / 12) * 2;
    tone(f, t, 0.3, { type: 'triangle', vol: 0.08 });
    tone(f * 2.01, t, 0.12, { type: 'sine', vol: 0.025 });
  }
  const d = DRUM[beat % 8];
  if (d === 'D') tone(92, t, 0.18, { vol: 0.2, slide: -30 });
  if (d === 'T') noise(t, 0.05, { vol: 0.09, freq: 2400, q: 3 });
  if (beat % 16 === 0) tone(D / 2, t, 1.4, { type: 'triangle', vol: 0.05 });
  beat++;
}

export function startMusic() {
  if (!ctx || timer) return;
  nextT = ctx.currentTime + 0.08;
  timer = setInterval(() => {
    while (nextT < ctx.currentTime + 0.25) {
      plan(nextT);
      nextT += 60 / 208;
    }
  }, 60);
}

export function stopMusic() {
  clearInterval(timer);
  timer = null;
}
