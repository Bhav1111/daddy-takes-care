/* ===== Daddy Takes Care — runtime ===== */
(() => {
'use strict';
const BYLINE = 'Words by Baruch Havia';
const DATA = JSON.parse(document.getElementById('narration-data').textContent);
const PAGES = DATA.pages, LAST = PAGES.length - 1;
PAGES.forEach(p => { p.words = p.lines.flatMap((l, li) => l.words.map(w => ({ ...w, li }))); });

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LITE = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory && navigator.deviceMemory <= 3);
const coreOf = w => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}’']+$/gu, '').toLowerCase();
const speakText = s => s.replace(/shhh’s/gi, 'shushes').replace(/’/g, "'");
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M15.5 5 8 12l7.5 7z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M8.5 5 16 12l-7.5 7z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5H9l-.3 2.6a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L4.6 11a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1L9 20.5h6l.3-2.6a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>',
  full: '<svg viewBox="0 0 24 24"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11z"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 14H7zm3-4h6l1 2h4v2H4V5h4z"/></svg>',
  ear: '<svg viewBox="0 0 24 24"><path d="M12 3a7 7 0 0 0-7 7h2a5 5 0 1 1 8.2 3.8c-1.3 1.1-2.2 2-2.2 4.2a2 2 0 0 1-4 0H7a4 4 0 0 0 8 0c0-1.2.4-1.6 1.5-2.6A7 7 0 0 0 12 3z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 4h6a3 3 0 0 1 2 .8A3 3 0 0 1 14 4h6v15h-6a2 2 0 0 0-2 1.5A2 2 0 0 0 10 19H4zm2 2v11h4a3 3 0 0 1 1 .2V7a2 2 0 0 0-1-1zm12 0h-4a2 2 0 0 0-1 1v10.2a3 3 0 0 1 1-.2h4z"/></svg>',
};
const FX = { stretching: 'stretch', rolling: 'roll', gnaw: 'chomp', coo: 'float', hide: 'peek', whispering: 'whisper', softly: 'whisper', quietly: 'whisper', smile: 'bounce', smiling: 'bounce', tongue: 'wiggle', bite: 'chomp', delight: 'bounce', oh: 'grow', good: 'bounce', tummy: 'squish', funny: 'wiggle', crawl: 'crawl', sing: 'dance', dance: 'dance', bright: 'shine', sunny: 'shine', ball: 'bounce', reach: 'stretch', darkened: 'dim', womb: 'heart', rub: 'rub', snuggle: 'squish', colder: 'shiver', tired: 'droop', delicious: 'wiggle', poof: 'poof', asleep: 'droop', dreaming: 'float', kisses: 'heart', 'well-wishes': 'float', 'shhh’s': 'shhh', shhh: 'shhh', taste: 'wiggle', full: 'grow', story: 'bounce', read: 'bounce', milk: 'bounce', wonder: 'float', day: 'shine', daddy: 'bounce', takes: 'bounce', care: 'heart', talking: 'wiggle', baby: 'bounce', end: 'grow', crib: 'bounce', limbs: 'stretch', thumb: 'chomp', dear: 'heart', true: 'heart', bib: 'wiggle', food: 'chomp', eyes: 'peek', nose: 'wiggle', shoulder: 'squish', sack: 'squish', noise: 'shiver', white: 'shine', ready: 'bounce' };
const PARTICLES = { coo: 'note', sing: 'note', dance: 'note', kisses: 'heart', 'well-wishes': 'heart', care: 'heart', poof: 'poof', asleep: 'zzz', dreaming: 'zzz', sunny: 'star', good: 'star', delight: 'star', bright: 'star', 'shhh’s': 'shh', shhh: 'shh', smile: 'heart', day: 'star', end: 'star', dear: 'heart', talking: 'note' };
const SHAPES = {
  heart: '<svg viewBox="-14 -14 28 28"><path d="M0 6C-12 -3 -6 -13 0 -6 6 -13 12 -3 0 6z" fill="#F26D85"/></svg>',
  star: '<svg viewBox="-14 -14 28 28"><path d="M0-12 3-4 12-3 5 3 7 12 0 7-7 12-5 3-12-3-3-4z" fill="#FFC83D"/></svg>',
  note: '<svg viewBox="-14 -14 28 28"><ellipse cx="-4" cy="7" rx="6" ry="4.5" fill="#4F5BB8"/><path d="M1 7V-10l10 3v4l-8-2.4V7z" fill="#4F5BB8"/></svg>',
  zzz: '<svg viewBox="-14 -14 28 28"><text x="0" y="6" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="20" fill="#9FA3D6">z</text></svg>',
  poof: '<svg viewBox="-14 -14 28 28"><circle r="10" fill="#E8E1F5"/></svg>',
  firefly: '<svg viewBox="-14 -14 28 28"><circle r="9" fill="#FFE58A" opacity=".35"/><circle r="3.5" fill="#FFF3B0"/></svg>',
  shh: '<svg viewBox="-20 -14 40 28"><text x="0" y="5" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="14" fill="#9FA3D6">shh</text><path d="M-14 6 14-6" stroke="#F26D85" stroke-width="3" stroke-linecap="round"/></svg>',
};
function spawn(kind, x, y, count = 6) {
  if (REDUCED) return;
  const fx = $('#fx'); if (fx.childElementCount > 80) return;
  for (let i = 0; i < count; i++) {
    const p = el('div', 'p', SHAPES[kind]); const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 90;
    const up = kind === 'zzz' || kind === 'note' || kind === 'heart';
    p.style.setProperty('--x', (x - 13 + (Math.random() - 0.5) * 30) + 'px'); p.style.setProperty('--y', (y - 13) + 'px');
    p.style.setProperty('--dx', (up ? (Math.random() - 0.3) * 90 : Math.cos(a) * d) + 'px');
    p.style.setProperty('--dy', (up ? -(60 + Math.random() * 100) : Math.sin(a) * d) + 'px');
    p.style.setProperty('--s', (0.8 + Math.random() * 1.1).toFixed(2)); p.style.setProperty('--rot', (Math.random() * 80 - 40).toFixed(0) + 'deg');
    p.style.setProperty('--dur', (1.2 + Math.random() * 0.8).toFixed(2) + 's');
    fx.append(p); setTimeout(() => p.remove(), 2200);
  }
}

/* ---------- settings ---------- */
const DEFAULTS = { narrator: 'story', auto: true, motion: true, sounds: true, noise: false, nudge: 0, voice: '' };
let stored = {}; try { stored = JSON.parse(localStorage.getItem('dtc-settings') || '{}'); } catch { stored = {}; }
const settings = Object.assign({}, DEFAULTS, stored);
const save = () => { try { localStorage.setItem('dtc-settings', JSON.stringify(settings)); } catch {} };

/* ---------- sound design (WebAudio) ---------- */
const Sound = {
  ctx: null, noiseSrc: null, noiseGain: null,
  ensure() { if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; this.ctx = new AC(); } if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return this.ctx; },
  turn() {
    if (!settings.sounds) return; const c = this.ensure(); if (!c) return;
    const len = Math.floor(c.sampleRate * 0.42), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.7) * (t < 0.06 ? t / 0.06 : 1); }
    const src = c.createBufferSource(); src.buffer = buf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.7;
    f.frequency.setValueAtTime(500, c.currentTime); f.frequency.exponentialRampToValueAtTime(2600, c.currentTime + 0.32);
    const g = c.createGain(); g.gain.value = 0.16; src.connect(f).connect(g).connect(c.destination); src.start();
  },
  chime(notes = [523.25, 659.25, 783.99]) {
    if (!settings.sounds) return; const c = this.ensure(); if (!c) return;
    notes.forEach((fq, i) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fq; const g = c.createGain(); const t0 = c.currentTime + i * 0.17; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.1, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.3); o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + 1.4); });
  },
  noise(on) {
    const c = this.ensure(); if (!c) return;
    if (on && !this.noiseSrc) {
      const len = c.sampleRate * 4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
      const g = c.createGain(); g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(0.08, c.currentTime + 1.8);
      src.connect(f).connect(g).connect(c.destination); src.start(); this.noiseSrc = src; this.noiseGain = g;
    } else if (!on && this.noiseSrc) {
      const g = this.noiseGain, s = this.noiseSrc; g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0, c.currentTime + 0.9);
      setTimeout(() => { try { s.stop(); } catch {} }, 1000); this.noiseSrc = null; this.noiseGain = null;
    }
  },
  burst(dur, f0, f1, gain, q = 0.8) { const c = this.ensure(); if (!c) return; const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.5) * (t < 0.05 ? t / 0.05 : 1); } const src = c.createBufferSource(); src.buffer = buf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, c.currentTime); f.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur); const g = c.createGain(); g.gain.value = gain; src.connect(f).connect(g).connect(c.destination); src.start(); },
  paper() { if (settings.sounds) this.burst(0.16, 900, 2200, 0.09); },
  flip() { if (settings.sounds) this.burst(0.22, 700, 1600, 0.12); },
  pop() { if (!settings.sounds) return; const c = this.ensure(); if (!c) return; const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(240, c.currentTime); o.frequency.exponentialRampToValueAtTime(520, c.currentTime + 0.12); const g = c.createGain(); g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.14, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.3); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.32); },
  rise() { if (!settings.sounds) return; [0, 140, 300].forEach((d, i) => setTimeout(() => this.burst(0.28, 400 + i * 200, 1400 + i * 300, 0.07, 0.6), d)); },
  tone(freq, t0, dur, gain = 0.08, type = 'sine') { const c = this.ctx; const o = c.createOscillator(); o.type = type; o.frequency.value = freq; const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05); },
  seq(notes, step = 0.12, dur = 0.35, gain = 0.07, type = 'sine') { if (!settings.sounds) return; const c = this.ensure(); if (!c) return; notes.forEach((f, i) => this.tone(f, c.currentTime + i * step, dur, gain, type)); },
  giggle() { this.seq([880, 1046.5, 1318.5, 1568], 0.07, 0.18, 0.06, 'triangle'); },
  hum() { this.seq([392, 440, 392], 0.26, 0.6, 0.045); },
  twinkle() { this.seq([1568, 1975.5, 2349.3, 2637], 0.06, 0.5, 0.04); },
  chirp() { this.seq([2200, 2800, 2400, 2900], 0.07, 0.12, 0.045); },
  lullaby() { this.seq([523.25, 587.33, 659.25, 587.33, 523.25, 392], 0.28, 0.7, 0.05); },
  brr() { this.seq([330, 311, 330, 311, 330, 311], 0.06, 0.1, 0.05, 'square'); },
  glug() { this.seq([180, 140, 200], 0.16, 0.2, 0.09); },
  boing() { if (!settings.sounds) return; const c = this.ensure(); if (!c) return; const o = c.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(520, c.currentTime); o.frequency.exponentialRampToValueAtTime(130, c.currentTime + 0.28); const g = c.createGain(); g.gain.setValueAtTime(0.09, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.32); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.34); },
  knock() { if (!settings.sounds) return; this.burst(0.07, 200, 120, 0.3, 2); setTimeout(() => this.burst(0.07, 200, 120, 0.3, 2), 190); },
  rattle() { if (!settings.sounds) return; [0, 70, 140, 230].forEach(d => setTimeout(() => this.burst(0.05, 1900, 1200, 0.1, 3), d)); },
  whoosh() { if (settings.sounds) this.burst(0.5, 300, 1900, 0.11, 0.5); },
  click() { if (settings.sounds) this.burst(0.03, 2600, 1800, 0.2, 4); },
  get noiseOn() { return !!this.noiseSrc; },
};

/* ---------- recordings (IndexedDB) ---------- */
const DB = {
  open() { return new Promise((res, rej) => { if (!('indexedDB' in window)) return rej(new Error('no-idb')); const r = indexedDB.open('daddy-takes-care', 1); r.onupgradeneeded = () => r.result.createObjectStore('rec'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('rec', mode), rq = fn(t.objectStore('rec')); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); },
  get(k) { return this.tx('readonly', st => st.get(k)); }, set(k, v) { return this.tx('readwrite', st => st.put(v, k)); },
  del(k) { return this.tx('readwrite', st => st.delete(k)); }, keys() { return this.tx('readonly', st => st.getAllKeys()); },
};
const recCache = new Map();
async function loadRecordings() { try { const keys = await DB.keys(); for (const k of keys) { const e = await DB.get(k); if (e) recCache.set(k, e); } } catch {} }
async function analyze(blob) {
  const c = Sound.ensure(); if (!c) return { start: 0, end: 0, duration: 0 };
  try {
    const buf = await c.decodeAudioData(await blob.arrayBuffer()); const d = buf.getChannelData(0); const fr = Math.floor(buf.sampleRate * 0.02); const env = [];
    for (let i = 0; i + fr <= d.length; i += fr) { let e = 0; for (let j = 0; j < fr; j++) { const v = d[i + j]; e += v * v; } env.push(10 * Math.log10(e / fr + 1e-10)); }
    let peak = -120; for (const v of env) if (v > peak) peak = v; const thr = peak - 28;
    let a = env.findIndex(v => v > thr), b = env.length - 1; while (b > 0 && env[b] <= thr) b--; if (a < 0) { a = 0; b = env.length - 1; }
    return { start: a * 0.02, end: (b + 1) * 0.02, duration: buf.duration };
  } catch { return { start: 0, end: 0, duration: 0 }; }
}
const Recorder = {
  rec: null, chunks: [], stream: null, page: null, t0: 0,
  mime() { const c = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']; return window.MediaRecorder ? (c.find(m => MediaRecorder.isTypeSupported(m)) || '') : ''; },
  async start(page) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) throw new Error('This browser can’t record audio. Try Safari or Chrome.');
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const mime = this.mime(); this.rec = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined); this.chunks = []; this.page = page;
    this.rec.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); }; this.rec.start(250); this.t0 = performance.now();
  },
  stop() {
    return new Promise(res => {
      const r = this.rec; if (!r) return res(null);
      r.onstop = async () => {
        const blob = new Blob(this.chunks, { type: r.mimeType || this.mime() || 'audio/webm' }); this.stream.getTracks().forEach(t => t.stop()); this.rec = null;
        const info = await analyze(blob); const entry = { blob, type: blob.type, ...info, when: Date.now() };
        try { await DB.set(this.page, entry); } catch {} recCache.set(this.page, entry); res(entry);
      };
      r.stop();
    });
  },
  get live() { return !!this.rec; },
};
function dadTiming(page, entry) {
  if (!entry.url) entry.url = URL.createObjectURL(entry.blob);
  const ws = page.words, b0 = ws[0].s, b1 = ws[ws.length - 1].e; const rs = entry.start, re = entry.end > entry.start + 0.3 ? entry.end : entry.duration; const k = (re - rs) / Math.max(0.1, b1 - b0);
  return { src: entry.url, words: ws.map(w => ({ s: rs + (w.s - b0) * k, e: rs + (w.e - b0) * k })) };
}

/* ---------- narrators ---------- */
class ClipNarrator {
  constructor() { this.a = new Audio(); this.a.preload = 'auto'; this.raf = 0; this.h = null; this.words = []; this.wi = -1; this.segEnd = null; this.src = ''; this.a.addEventListener('ended', () => { cancelAnimationFrame(this.raf); const h = this.h; this.h = null; if (h && h.onEnd) h.onEnd(); }); }
  load(src) { if (this.src !== src) { this.a.src = src; this.src = src; } }
  async ready() { if (this.a.readyState >= 1) return; await new Promise(r => { const done = () => r(); this.a.addEventListener('loadedmetadata', done, { once: true }); this.a.addEventListener('error', done, { once: true }); setTimeout(done, 1500); }); }
  async play(timing, h, wi = 0, onlyWord = false) {
    this.stop(); this.h = h; this.words = timing.words; this.wi = wi - 1; const w = timing.words[wi]; this.segEnd = onlyWord ? w.e + 0.05 : null; this.load(timing.src);
    await this.ready(); if (this.h !== h) return false;
    try { this.a.currentTime = wi === 0 && !onlyWord ? 0 : Math.max(0, w.s - 0.02); } catch {}
    try { await this.a.play(); } catch (e) { if (this.h === h) this.h = null; if (h.onError) h.onError(e); return false; }
    this.tick(); return true;
  }
  tick() {
    cancelAnimationFrame(this.raf);
    const step = () => {
      if (!this.h) return; const t = this.a.currentTime + settings.nudge / 1000; let i = this.wi;
      while (i + 1 < this.words.length && t >= this.words[i + 1].s) i++;
      if (i !== this.wi) { this.wi = i; if (i >= 0) this.h.onWord(i); }
      if (this.segEnd != null && t >= this.segEnd) { this.a.pause(); const h = this.h; this.h = null; if (h.onSegmentEnd) h.onSegmentEnd(); return; }
      if (!this.a.paused) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
  pause() { this.a.pause(); cancelAnimationFrame(this.raf); }
  resume() { if (!this.h) return false; this.a.play().catch(() => {}); this.tick(); return true; }
  stop() { cancelAnimationFrame(this.raf); this.h = null; this.a.pause(); }
  get active() { return !!this.h; } get paused() { return this.a.paused; }
  unlock(src) { this.load(src); const p = this.a.play(); if (p && p.then) p.then(() => this.a.pause()).catch(() => {}); }
}
class DeviceNarrator {
  constructor() { this.ok = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; this.h = null; this.raf = 0; this.factor = 1; this.timer = 0; }
  voices() { return this.ok ? speechSynthesis.getVoices().filter(v => (v.lang || '').toLowerCase().startsWith('en')) : []; }
  voice() { const vs = this.voices(); if (settings.voice) { const v = vs.find(v => v.voiceURI === settings.voice); if (v) return v; } for (const p of ['Samantha', 'Google US English', 'Ava', 'Allison', 'Karen', 'Daniel', 'Moira', 'Tessa', 'Aria', 'Jenny']) { const v = vs.find(v => v.name.includes(p)); if (v) return v; } return vs[0] || null; }
  play(page, h, fromWord = 0, onlyWord = false) {
    this.stop(); this.h = h; const words = page.words, startLi = words[fromWord].li, v = this.voice();
    const speakLine = li => {
      if (!this.h) return;
      if (li >= page.lines.length) { const hh = this.h; this.h = null; if (hh.onEnd) hh.onEnd(); return; }
      const lineWords = words.map((w, i) => ({ ...w, i })).filter(w => w.li === li); const first = li === startLi ? lineWords.findIndex(w => w.i === fromWord) : 0; const toks = lineWords.slice(first);
      const u = new SpeechSynthesisUtterance(onlyWord ? speakText(coreOf(words[fromWord].w)) : speakText(toks.map(w => w.w).join(' ')));
      if (v) u.voice = v; u.rate = 0.9; u.pitch = 1.02;
      const offsets = []; let pos = 0; toks.forEach(w => { offsets.push(pos); pos += speakText(w.w).length + 1; });
      let gotBoundary = false, estI = -1; const t0 = performance.now(), b0 = toks[0].s, built = toks[toks.length - 1].e - b0;
      u.onboundary = ev => { if (ev.name && ev.name !== 'word') return; gotBoundary = true; cancelAnimationFrame(this.raf); let k = 0; while (k + 1 < offsets.length && offsets[k + 1] <= ev.charIndex) k++; if (this.h) this.h.onWord(toks[k].i); };
      u.onstart = () => {
        if (onlyWord) { if (this.h) this.h.onWord(fromWord); return; }
        const step = () => { if (!this.h || gotBoundary) return; const e = (performance.now() - t0) / 1000 * this.factor; let k = estI; while (k + 1 < toks.length && e >= toks[k + 1].s - b0) k++; if (k !== estI) { estI = k; if (k >= 0) this.h.onWord(toks[k].i); } this.raf = requestAnimationFrame(step); };
        if (this.h) this.h.onWord(toks[0].i); estI = 0; this.raf = requestAnimationFrame(step);
      };
      u.onend = () => { cancelAnimationFrame(this.raf); if (!this.h) return; const took = (performance.now() - t0) / 1000; if (!gotBoundary && !onlyWord && took > 0.6 && built > 0.6) this.factor = clamp(this.factor * 0.5 + (built / took) * 0.5, 0.5, 2.2); if (onlyWord) { const hh = this.h; this.h = null; if (hh.onSegmentEnd) hh.onSegmentEnd(); return; } this.timer = setTimeout(() => speakLine(li + 1), 380); };
      u.onerror = e => { if (!this.h || e.error === 'interrupted' || e.error === 'canceled') return; const hh = this.h; this.h = null; if (hh.onError) hh.onError(e); };
      speechSynthesis.speak(u);
    };
    speakLine(startLi); return true;
  }
  pause() { if (this.ok) speechSynthesis.pause(); }
  resume() { if (this.ok) speechSynthesis.resume(); return !!this.h; }
  stop() { cancelAnimationFrame(this.raf); clearTimeout(this.timer); this.h = null; if (this.ok) try { speechSynthesis.cancel(); } catch {} }
  get active() { return !!this.h; } get paused() { return this.ok && speechSynthesis.paused; }
}
const clip = new ClipNarrator(), device = new DeviceNarrator();

/* ---------- state ---------- */
const book = $('#book'), spread = $('#spread');
const state = { page: 0, mode: 'listen', leaf: null, turning: false, autoTimer: 0, kind: 'story', warned: false };
const current = () => state.kind === 'device' ? device : clip;
function narratorFor(page, i) {
  if (settings.narrator === 'dad') { const e = recCache.get(i); if (e && e.duration > 0.5) return { kind: 'dad', timing: dadTiming(page, e) }; if (!state.warned) { state.warned = true; toast('No recording for this page yet, so the storyteller reads it. Record in “For the grown-ups”.'); } }
  if (settings.narrator === 'device' && device.ok) return { kind: 'device' };
  return { kind: 'story', timing: { src: page.audio, words: page.words } };
}

/* ---------- building a leaf (one spread of the book) ---------- */
function dayArc(i) {
  const N = LAST - 1, t = i === 0 ? 0 : i === LAST ? 1 : (i - 1) / (N - 1);
  const pt = u => [20 + 260 * u, 52 - 176 * u * (1 - u)];
  const dots = Array.from({ length: N }, (_, k) => { const [x, y] = pt(k / (N - 1)); const p = k + 1; return `<circle class="dot${p < i || i === LAST ? ' done' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p === i ? 6 : 4}" data-go="${p}"><title>Page ${p}</title></circle>`; }).join('');
  const [mx, my] = pt(t); const night = /dusk|night/.test(PAGES[i].tone);
  const marker = night ? `<g class="marker" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><circle r="11"/><circle r="9" cx="5" cy="-3" fill="var(--paper)"/></g>` : `<g class="marker" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><circle r="9"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="0" y1="-12" x2="0" y2="-15" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" transform="rotate(${a})"/>`).join('')}</g>`;
  return `<div class="dayarc" aria-hidden="true"><svg viewBox="0 0 300 70"><path class="track" d="M 20,52 Q 150,-36 280,52"/>${dots}${marker}</svg></div>`;
}
function stanzaHTML(page, i) {
  let gi = 0; const isCover = i === 0, isEnd = i === LAST;
  const lines = page.lines.map((l, li) => { const cls = isCover ? ['title', 'sub', 'tagline'][li] || '' : isEnd ? 'end' : ''; const ws = l.words.map(w => { const fx = FX[coreOf(w.w)]; const s = `<span class="w${fx ? ' fx-' + fx : ''}" data-i="${gi}" style="--i:${gi}">${esc(w.w)}</span>`; gi++; return s; }).join(' '); return `<p class="line ${cls}">${ws}</p>`; }).join('');
  let extra = '';
  if (isCover) extra = `<div class="actions"><button class="btn primary" data-act="listen">${ICON.ear}Read to me</button><button class="btn" data-act="read">${ICON.book}I’ll read it</button></div><div class="actions" style="margin-top:4px"><button class="btn link" data-act="grown">For the grown-ups</button></div><p class="byline">${esc(BYLINE)}</p>`;
  if (isEnd) extra = `<div class="actions"><button class="btn primary" data-act="again">${ICON.play}Read again</button><button class="btn" data-act="record">${ICON.mic}Record Daddy’s voice</button><button class="btn link" data-act="grown">For the grown-ups</button></div>`;
  return lines + extra;
}
function buildLeaf(i) {
  const page = PAGES[i], sc = Art.SCENES[page.scene]();
  const leaf = el('div', `leaf enter tone-${page.tone}`);
  const layers = sc.layers.map((l, k) => `<div class="layer${l.shadow ? ' shadow' : ''}" style="--z:${l.z}"><div class="rise" style="transition-delay:${200 + k * 70}ms"><svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${l.svg}</svg></div></div>`).join('');
  const dim = sc.dim ? ` style="--lx:${sc.dim.x}%;--ly:${sc.dim.y}%"` : '';
  const label = i === 0 ? 'Cover' : i === LAST ? 'The end' : `Page ${i} of ${LAST - 1}`;
  const who = settings.narrator === 'dad' ? 'Daddy’s voice' : settings.narrator === 'device' ? 'This device’s voice' : 'Storyteller';
  leaf.innerHTML = `<div class="plate"><div class="stage"><div class="scene ${sc.root || ''}">${layers}</div><div class="dim"${dim}></div><div class="tint"></div><div class="flash"></div><div class="vignette"></div></div></div>
    <div class="page-text"><div class="grain"></div><div class="page-head">${dayArc(i)}<span class="page-label">${label}</span></div><div class="stanza" aria-live="polite">${stanzaHTML(page, i)}</div><div class="page-foot"><span class="hint">${i === 0 ? 'Every word lights up as it’s read' : 'Tap any word to hear it'}</span><span class="credit">${i === 0 ? '' : who}</span></div></div>`;
  leaf._cues = Object.fromEntries(Object.entries(sc.cues || {}).map(([k, v]) => [coreOf(k), v])); leaf._fired = new Set(); leaf._page = i; leaf._mechs = sc.mechs || {};
  return leaf;
}
const wordEls = leaf => leaf._words || (leaf._words = [...leaf.querySelectorAll('.w')]);

/* ---------- highlighting, cues, effects ---------- */
function markWord(leaf, i) {
  const ws = wordEls(leaf);
  ws.forEach((w, k) => { if (k < i) { w.classList.remove('on'); w.classList.add('read'); } else if (k > i) w.classList.remove('on', 'read'); });
  const w = ws[i]; if (!w) return;
  w.classList.remove('on'); void w.offsetWidth; w.classList.add('on', 'read');
  const core = coreOf(w.textContent); const pk = PARTICLES[core];
  if (pk) { const r = w.getBoundingClientRect(); spawn(pk, r.left + r.width / 2, r.top + r.height / 2, pk === 'shh' ? 1 : 5); }
  const cue = leaf._cues[core]; if (cue && !leaf._fired.has(core)) { leaf._fired.add(core); fireCue(leaf, cue); }
}
function fireCue(leaf, cue) {
  const scene = $('.scene', leaf), stage = $('.stage', leaf);
  for (const part of String(cue).split('+')) {
    const [kind, arg] = part.split(':');
    if (kind === 'pull') { autoPull(leaf); continue; }
    if (kind === 'flap') { openFlap(leaf, arg); continue; }
    if (kind === 'spin') { const w = $('[data-mech="wheel"]', leaf); if (w) tweenSpin(w, spinOf(w) + 360, 1600); continue; }
    if (kind === 'dim') { stage.classList.add('dimmed'); continue; }
    if (kind === 'flash') { flashClass(stage, 'warm', 1700); continue; }
    if (kind === 'noise') { scene.classList.add('cue-noise'); if (settings.noise && !Sound.noiseOn) { Sound.noise(true); const m = $('.noise', leaf); m && m.classList.add('on'); } continue; }
    const name = kind === 'class' ? arg : kind;
    scene.classList.add('cue-' + name);
    if (name === 'poof') { const r = stage.getBoundingClientRect(); spawn('poof', r.left + r.width * 0.42, r.top + r.height * 0.45, 12); }
    if (name === 'sparkle' || name === 'twinkle') Sound.chime([783.99, 1046.5, 1318.5]);
  }
}

/* ---------- pop-up mechanics: pull tabs, flaps, wheels ---------- */
function setupMechs(leaf) {
  const stage = $('.stage', leaf), m = leaf._mechs || {};
  leaf._mech = { pull: 0, raf: 0 };
  if (m.pull) {
    const tab = el('button', 'tab' + (state.tabHinted ? '' : ' hint'), '<span>pull</span>'); state.tabHinted = true;
    tab.setAttribute('aria-label', 'Pull tab: ' + (m.pull.hint || 'moves the picture'));
    stage.append(tab);
    let drag = null;
    tab.addEventListener('pointerdown', e => { e.preventDefault(); try { tab.setPointerCapture(e.pointerId); } catch {} drag = { x: e.clientX, from: leaf._mech.pull, id: e.pointerId }; cancelAnimationFrame(leaf._mech.raf); tab.classList.add('grab'); tab.classList.remove('hint'); Sound.ensure(); Sound.paper(); });
    tab.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; setPull(leaf, clamp(drag.from + (drag.x - e.clientX) / 110, 0, 1)); });
    const release = e => { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; tab.classList.remove('grab'); if (leaf._mech.pull > 0.96) { Sound.pop(); tweenPull(leaf, 0, 700, 900); } else tweenPull(leaf, 0, 500); };
    tab.addEventListener('pointerup', release); tab.addEventListener('pointercancel', release);
    tab.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Sound.ensure(); autoPull(leaf); } });
  }
}
function setPull(leaf, p) { leaf._mech.pull = p; const sc = $('.scene', leaf); if (sc) sc.style.setProperty('--pull', p.toFixed(3)); const tab = $('.tab', leaf); if (tab) tab.style.transform = `translateX(${(-p * 64).toFixed(1)}px)`; }
function tweenPull(leaf, to, dur, delay = 0) {
  cancelAnimationFrame(leaf._mech.raf); const from = leaf._mech.pull, t0 = performance.now() + delay;
  const step = now => { if (now < t0) { leaf._mech.raf = requestAnimationFrame(step); return; } const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); setPull(leaf, from + (to - from) * e); if (k < 1) leaf._mech.raf = requestAnimationFrame(step); };
  leaf._mech.raf = requestAnimationFrame(step);
}
function autoPull(leaf) { if (!leaf._mech) return; const tab = $('.tab', leaf); if (tab) tab.classList.remove('hint'); Sound.paper(); tweenPull(leaf, 1, 800); setTimeout(() => { if (leaf === state.leaf) { Sound.pop(); tweenPull(leaf, 0, 800, 900); } }, 850); }
function openFlap(leaf, name) { const f = name ? $(`[data-mech="flap"].${name}`, leaf) : $('[data-mech="flap"]', leaf); if (f && !f.classList.contains('open')) { f.classList.add('open'); Sound.flip(); } }
function toggleFlap(f) { f.classList.toggle('open'); Sound.ensure(); Sound.flip(); }
const spinOf = w => parseFloat(w.style.getPropertyValue('--spin')) || 0;
const setSpin = (w, v) => w.style.setProperty('--spin', v.toFixed(2) + 'deg');
function coast(w, v) { cancelAnimationFrame(w._raf); const step = () => { v *= 0.965; setSpin(w, spinOf(w) + v); if (Math.abs(v) > 0.05) w._raf = requestAnimationFrame(step); }; w._raf = requestAnimationFrame(step); }
function tweenSpin(w, to, dur) { cancelAnimationFrame(w._raf); const from = spinOf(w), t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); setSpin(w, from + (to - from) * e); if (k < 1) w._raf = requestAnimationFrame(step); }; w._raf = requestAnimationFrame(step); }
let wheel = null;
spread.addEventListener('pointerdown', e => {
  const w = e.target.closest('[data-mech="wheel"]'); if (!w) return;
  e.preventDefault(); const r = w.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  wheel = { el: w, cx, cy, last: Math.atan2(e.clientY - cy, e.clientX - cx), v: 0, moved: 0, t: performance.now(), id: e.pointerId };
  cancelAnimationFrame(w._raf); try { w.setPointerCapture(e.pointerId); } catch {}
});
spread.addEventListener('pointermove', e => {
  if (!wheel || e.pointerId !== wheel.id) return;
  const a = Math.atan2(e.clientY - wheel.cy, e.clientX - wheel.cx); let d = a - wheel.last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; wheel.last = a;
  const deg = d * 180 / Math.PI, now = performance.now(); wheel.moved += Math.abs(deg); wheel.v = deg / Math.max(1, now - wheel.t) * 16; wheel.t = now; setSpin(wheel.el, spinOf(wheel.el) + deg);
});
const endWheel = e => { if (!wheel || (e && e.pointerId !== wheel.id)) return; const w = wheel; wheel = null; Sound.ensure(); state.wheelDragged = w.moved >= 4; if (w.moved < 4) { Sound.chime([659.25, 783.99, 987.77]); tweenSpin(w.el, spinOf(w.el) + 360, 1500); } else coast(w.el, w.v); };
spread.addEventListener('pointerup', endWheel); spread.addEventListener('pointercancel', endWheel);
function clearWords(leaf) { wordEls(leaf).forEach(w => w.classList.remove('on', 'read')); }

/* ---------- narration control ---------- */
async function startNarration(fromWord = 0, onlyWord = false) {
  const leaf = state.leaf, i = state.page, page = PAGES[i]; if (!leaf || state.turning) return;
  clearTimeout(state.autoTimer); clip.stop(); device.stop();
  const sel = narratorFor(page, i); state.kind = sel.kind;
  const h = {
    onWord: k => { if (leaf === state.leaf) markWord(leaf, k); },
    onEnd: () => onPageEnd(leaf),
    onSegmentEnd: () => { const w = wordEls(leaf)[fromWord]; if (w) w.classList.remove('on'); updateControls(); },
    onError: () => { toast('Tap the play button to hear this page.'); updateControls(); },
  };
  if (fromWord === 0 && !onlyWord) clearWords(leaf);
  if (sel.kind === 'device') device.play(page, h, fromWord, onlyWord); else await clip.play(sel.timing, h, fromWord, onlyWord);
  updateControls();
}
function onPageEnd(leaf) {
  if (leaf !== state.leaf) return; updateControls();
  if (state.mode === 'listen' && settings.auto && state.page < LAST) state.autoTimer = setTimeout(() => go(state.page + 1, 1), state.page === 0 ? 900 : 1500);
}
function togglePlay() {
  const n = current();
  if (n.active && !n.paused) n.pause(); else if (n.active && n.paused) n.resume(); else { startNarration(0); return; }
  updateControls();
}

/* ---------- page turning ---------- */
async function go(i, dir = 1) {
  if (state.turning || i < 0 || i > LAST) return;
  clearTimeout(state.autoTimer); clip.stop(); device.stop();
  state.turning = true;
  const old = state.leaf, leaf = buildLeaf(i), tone = PAGES[i].tone;
  leaf.classList.add('folded');
  book.className = `book tone-${tone}${i === 0 ? ' cover' : ''}${LITE ? ' lite' : ''}`;
  if (!/dusk|night/.test(tone) && Sound.noiseOn) Sound.noise(false);
  if (!old) spread.append(leaf);
  else if (dir >= 0) { spread.insertBefore(leaf, old); old.classList.add('turn-out', 'folding'); }
  else { spread.append(leaf); leaf.classList.add('turn-in'); old.classList.add('folding'); }
  setupMechs(leaf);
  void leaf.offsetWidth; leaf.classList.remove('folded'); setTimeout(() => Sound.rise(), 150);
  if (old) Sound.turn();
  if (i === 1 && !state.hinted) { state.hinted = true; setTimeout(() => toast('Pull the paper tab, lift the flaps, spin the sun.', 4200), 1600); }
  state.leaf = leaf; state.page = i; updateControls();
  await wait(old ? (REDUCED ? 380 : 920) : 50);
  if (old) old.remove(); leaf.classList.remove('turn-in'); state.turning = false;
  setTimeout(() => leaf.classList.remove('enter'), 2200);
  if (state.mode === 'listen' && old && i > 0) { await wait(420); if (state.leaf === leaf) startNarration(0); }
}

/* ---------- controls ---------- */
const btn = id => $('#' + id);
function updateControls() {
  const n = current(), playing = n.active && !n.paused;
  btn('btnPlay').innerHTML = playing ? ICON.pause : ICON.play; btn('btnPlay').setAttribute('aria-label', playing ? 'Pause' : 'Read this page');
  btn('btnPrev').disabled = state.page <= 0 || state.turning; btn('btnNext').disabled = state.page >= LAST || state.turning; btn('btnHome').disabled = state.page === 0;
  const pill = btn('btnMode'); pill.innerHTML = `<span class="dotv"></span>${state.mode === 'listen' ? 'Read to me' : 'I’ll read it'}`; pill.setAttribute('aria-label', `Reading mode: ${state.mode === 'listen' ? 'read to me' : 'I read it myself'}. Tap to switch.`);
}
function toast(msg, ms = 3200) { const t = $('#toast'); t.textContent = msg; t.hidden = false; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => { t.classList.remove('show'); }, ms); }

btn('btnPrev').addEventListener('click', () => go(state.page - 1, -1));
btn('btnNext').addEventListener('click', () => go(state.page + 1, 1));
btn('btnHome').addEventListener('click', () => go(0, -1));
btn('btnPlay').addEventListener('click', () => { Sound.ensure(); togglePlay(); });
btn('btnMode').addEventListener('click', () => { state.mode = state.mode === 'listen' ? 'read' : 'listen'; if (state.mode === 'read') { clearTimeout(state.autoTimer); } updateControls(); toast(state.mode === 'listen' ? 'The book reads aloud and turns its own pages.' : 'You read. Tap ▶ to hear a page, or tap a word.'); });
btn('btnGrown').addEventListener('click', openModal);
const fsEl = document.documentElement, canFS = !!(fsEl.requestFullscreen || fsEl.webkitRequestFullscreen);
if (!canFS) btn('btnFull').hidden = true;
btn('btnFull').addEventListener('click', () => { if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else (fsEl.requestFullscreen || fsEl.webkitRequestFullscreen).call(fsEl); });

spread.addEventListener('click', e => {
  const w = e.target.closest('.w'); if (w && state.leaf) { Sound.ensure(); const i = +w.dataset.i; pokeWord(coreOf(w.textContent)); startNarration(i, state.mode === 'read'); return; }
  const act = e.target.closest('[data-act]'); if (act) { onAction(act.dataset.act); return; }
  const dot = e.target.closest('[data-go]'); if (dot) { go(+dot.dataset.go, +dot.dataset.go > state.page ? 1 : -1); return; }
  const flap = e.target.closest('[data-mech="flap"]'); if (flap) { toggleFlap(flap); return; }
  const tap = e.target.closest('[data-tap]'); if (tap && !(state.wheelDragged && e.target.closest('[data-mech="wheel"]'))) onTap(tap); state.wheelDragged = false;
});
function onAction(a) {
  Sound.ensure();
  if (a === 'listen') { state.mode = 'listen'; updateControls(); startNarration(0); }
  if (a === 'read') { state.mode = 'read'; clip.unlock(PAGES[1].audio); go(1, 1); }
  if (a === 'again') go(0, 1);
  if (a === 'grown' || a === 'record') openModal(a === 'record');
}
/* what happens when you tap a thing: a tiny action language, one line per surprise */
const TAPS = {
  baby: ['hop', 'sound:giggle', 'spawn:note:4', 'bubble', 'face:1300', 'scene!clap:1600', 'scene!thought:2600'],
  dad: ['hop', 'sound:hum', 'spawn:heart:4', 'scene!kissfly:1800', 'scene!wisp:1900', 'scene!spin:1300'],
  bunny: ['flash:wiggle:1100', 'flash:hopto:1500', 'sound:boing', 'spawn:heart:3'],
  ball: ['flash:tapped:1300', 'sound:boing'],
  noise: ['noise'],
  sun: ['toggle:lit', 'toggle:cool', 'sound:twinkle', 'scene!flock:7500', 'spawn:star:6'],
  house: ['toggle:open', 'sound:boing', 'sound:lullaby'],
  chimney: ['spawn:zzz:4', 'sound:hum'],
  cloud: ['wobble', 'spawn:heart:6', 'sound:twinkle'],
  crib: ['scene!rock:2500', 'sound:lullaby', 'scenetoggle:cribfloat'],
  window: ['toggle:sing', 'sound:chirp', 'spawn:note:4'],
  curtains: ['flash:gust:2500', 'sound:paper'],
  orbit: ['flash:scatter:2500', 'sound:twinkle', 'spawn:star:5'],
  plant: ['toggle:grown', 'sound:twinkle', 'spawn:star:5'],
  door: ['wobble', 'sound:knock'],
  rug: ['flash:ripple:1600', 'sound:twinkle'],
  mat: ['flash:ripple:1600', 'sound:twinkle'],
  shelf: ['flash:rattle:1200', 'sound:rattle'],
  fruit: ['hop', 'sound:boing'],
  spoon: ['flash:loop:1350', 'sound:whoosh', 'scene!yum:2000'],
  tray: ['toggle:doodle', 'sound:twinkle'],
  chair: ['wobble', 'sound:boing'],
  armchair: ['wobble', 'sound:boing', 'spawn:zzz:2'],
  blocks: ['toggle:flip', 'sound:rattle'],
  sofa: ['toggle:peek', 'sound:boing', 'spawn:note:3'],
  frames: ['flash:alive:2500', 'sound:twinkle'],
  rainbow: ['flash:shimmer:2500', 'sound:twinkle', 'spawn:star:8'],
  lamp: ['toggle:off', 'stagetoggle:dimmed', 'scenetoggle:dark2', 'sound:click'],
  bookshelf: ['toggle:peek', 'sound:boing'],
  moon: ['flash:yawning:1900', 'spawn:zzz:3', 'sound:hum', 'scene!shootnow:1600', 'scene!twinklefast:2500'],
  thermo: ['scenetoggle:cold', 'stagetoggle:cold', 'sound:brr'],
  nightlight: ['cycle:c1,c2,c3', 'sound:click'],
  bottle: ['flash:fizz:2900', 'sound:glug'],
  dream: ['flash:big:1900', 'spawn:heart:6', 'sound:twinkle'],
  stars: ['toggle:lit', 'sound:twinkle', 'spawn:star:4'],
  shh: ['flash:popped:900', 'sound:pop'],
  grass: ['spawn:firefly:12', 'sound:twinkle'],
};
function flashClass(elm, cls, ms) { elm.classList.remove(cls); void elm.getBoundingClientRect(); elm.classList.add(cls); clearTimeout(elm['_t_' + cls]); elm['_t_' + cls] = setTimeout(() => elm.classList.remove(cls), ms); }
function onTap(g) {
  const kind = g.dataset.tap, leaf = state.leaf, scene = $('.scene', leaf), stage = $('.stage', leaf), r = g.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height * 0.25;
  Sound.ensure();
  for (const act of TAPS[kind] || ['hop']) {
    const [op, a, b] = act.split(':');
    if (op === 'hop') flashClass(g, 'prop-tapped', 700);
    else if (op === 'wobble') flashClass(g, 'wobble', 650);
    else if (op === 'flash') flashClass(g, a, +b);
    else if (op === 'toggle') g.classList.toggle(a);
    else if (op === 'cycle') { const cs = a.split(','); const i = cs.findIndex(c => g.classList.contains(c)); g.classList.remove(...cs); g.classList.add(cs[(i + 1) % cs.length]); }
    else if (op === 'scene!') flashClass(scene, 'cue-' + a, +b);
    else if (op === 'scenetoggle') scene.classList.toggle('cue-' + a);
    else if (op === 'stagetoggle') stage.classList.toggle(a);
    else if (op === 'sound' && Sound[a]) Sound[a]();
    else if (op === 'spawn') spawn(a, cx, cy, +b);
    else if (op === 'bubble') { const bb = $('.bubble', leaf); if (bb) flashClass(bb, 'show', 1500); }
    else if (op === 'face') { const f = $('.face', g); if (f) flashClass(f, 'alt', +a); }
    else if (op === 'noise') { const on = !Sound.noiseOn; Sound.noise(on); g.classList.toggle('on', on); toast(on ? 'White noise on — a gentle hush, like the womb.' : 'White noise off.'); }
  }
}
/* the words know their pictures: tap a word and the thing it names answers back */
const WORD_TARGETS = { crib: '.crib', thumb: '.thumb', mobile: '.hang', bib: '.baby', bowl: '.lidflap', spoon: '.spoon', chair: '.chair, .armchair', tummy: '.baby', ball: '.ball', sun: '.sun', sunny: '.sun', rainbow: '.rainbow', room: '.window', window: '.window', lamp: '.lamp', story: '.book', book: '.book', read: '.book', shoulder: '.dad', sack: '.sack', bottle: '.bottle', milk: '.milk', moon: '.moon', kisses: '.dad', daddy: '.dad', eyes: '.face', nose: '.face', door: '.door, .flap.door', bunny: '.bunny', 'shhh’s': '.shh', noise: '.noise', dreaming: '.dream', dance: '.dad', sing: '.dad', house: '.house', rub: '.rub', food: '.lidflap', hide: '.flap.door', side: '.roll' };
function pokeWord(word) {
  const sel = WORD_TARGETS[word]; if (!sel || !state.leaf) return; const t = $(sel, state.leaf); if (!t) return;
  flashClass(t, 'prop-tapped', 700); const r = t.getBoundingClientRect(); spawn('star', r.left + r.width / 2, r.top + r.height / 2, 5);
}
document.addEventListener('keydown', e => {
  if (!$('#modal').hidden) { if (e.key === 'Escape') closeModal(); return; }
  if (e.target.matches('input, select, textarea')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') go(state.page + 1, 1);
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(state.page - 1, -1);
  else if (e.key === ' ' || e.key === 'Enter') { if (e.target.tagName !== 'BUTTON') { e.preventDefault(); Sound.ensure(); if (state.page === 0 && !current().active) onAction('listen'); else togglePlay(); } }
  else if (e.key === 'Home') go(0, -1);
});
let sw = null;
spread.addEventListener('pointerdown', e => { if (e.target.closest('button, .w, [data-tap], [data-go], [data-mech], .tab')) return; sw = { x: e.clientX, y: e.clientY, t: Date.now() }; });
spread.addEventListener('pointerup', e => { if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y, dt = Date.now() - sw.t; sw = null; if (Math.abs(dx) > 60 && Math.abs(dy) < 90 && dt < 900) go(state.page + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && dt < 600 && e.target.closest('.stage')) { Sound.ensure(); spawn('star', e.clientX, e.clientY, 7); Sound.twinkle(); } });
spread.addEventListener('pointercancel', () => { sw = null; });

/* ---------- parallax: pointer, tilt, and a slow idle drift ---------- */
const par = { tx: 0, ty: 0, x: 0, y: 0 };
spread.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !settings.motion) return; const r = spread.getBoundingClientRect(); par.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; par.ty = ((e.clientY - r.top) / r.height - 0.5) * 2; });
spread.addEventListener('pointerleave', () => { par.tx = 0; par.ty = 0; });
let tiltOn = false;
function onOrient(e) { if (!settings.motion || e.gamma == null) return; const portrait = innerHeight >= innerWidth; const g = portrait ? e.gamma : e.beta, b = portrait ? e.beta : -e.gamma; par.tx = clamp(g / 28, -1, 1); par.ty = clamp((b - 42) / 30, -1, 1); }
async function enableTilt() {
  if (tiltOn || !('DeviceOrientationEvent' in window)) return;
  try { if (typeof DeviceOrientationEvent.requestPermission === 'function') { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return; } addEventListener('deviceorientation', onOrient); tiltOn = true; } catch {}
}
(function loop(now) {
  const live = settings.motion && !REDUCED; par.x += (par.tx - par.x) * 0.06; par.y += (par.ty - par.y) * 0.06;
  const sc = state.leaf && $('.scene', state.leaf);
  if (sc) { const ry = live ? par.x * 6 + Math.sin(now / 3100) * 1.3 : 0, rx = live ? -par.y * 4 + Math.cos(now / 4300) * 0.9 : 0; sc.style.setProperty('--rx', rx.toFixed(2) + 'deg'); sc.style.setProperty('--ry', ry.toFixed(2) + 'deg'); }
  requestAnimationFrame(loop);
})(0);

/* ---------- grown-ups panel ---------- */
const modal = $('#modal');
function openModal(scrollToRec = false) {
  clip.pause(); if (device.active) device.pause(); updateControls();
  syncSettingsUI(); renderRecList(); modal.hidden = false; $('#modalClose').focus();
  if (scrollToRec) setTimeout(() => $('#recList').scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}
function closeModal() { if (Recorder.live) return toast('Stop the recording first.'); modal.hidden = true; }
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
function syncSettingsUI() {
  $('#segNarrator').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === settings.narrator)));
  $('#rowVoice').hidden = settings.narrator !== 'device';
  modal.querySelectorAll('.switch[data-set]').forEach(s => s.setAttribute('aria-checked', String(!!settings[s.dataset.set])));
  $('#nudge').value = settings.nudge; $('#nudgeVal').textContent = (settings.nudge > 0 ? '+' : '') + settings.nudge + ' ms';
  fillVoices();
}
function fillVoices() {
  const sel = $('#voiceSel'); const vs = device.voices(); sel.innerHTML = vs.length ? vs.map(v => `<option value="${esc(v.voiceURI)}"${v.voiceURI === settings.voice ? ' selected' : ''}>${esc(v.name)}</option>`).join('') : '<option value="">No English voices found</option>';
  if (!settings.voice && vs.length) { const v = device.voice(); if (v) sel.value = v.voiceURI; }
}
if (device.ok) speechSynthesis.addEventListener('voiceschanged', fillVoices);
$('#segNarrator').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; settings.narrator = b.dataset.v; save(); syncSettingsUI(); if (settings.narrator === 'device' && !device.ok) toast('This browser has no speech voices. The storyteller will read instead.'); });
$('#voiceSel').addEventListener('change', e => { settings.voice = e.target.value; save(); });
modal.addEventListener('click', e => {
  const s = e.target.closest('.switch[data-set]'); if (!s) return; const k = s.dataset.set; settings[k] = !settings[k]; save(); syncSettingsUI();
  if (k === 'motion' && settings.motion) enableTilt();
  if (k === 'noise' && !settings.noise && Sound.noiseOn) Sound.noise(false);
});
$('#nudge').addEventListener('input', e => { settings.nudge = +e.target.value; save(); $('#nudgeVal').textContent = (settings.nudge > 0 ? '+' : '') + settings.nudge + ' ms'; });

let previewAudio = null, recTimer = 0;
function renderRecList() {
  const list = $('#recList'); list.innerHTML = PAGES.map((p, i) => {
    const e = recCache.get(i); const name = i === 0 ? 'Cover' : i === LAST ? 'The end' : `Page ${i}`; const first = p.lines[0].text.split(' ').slice(0, 5).join(' ') + (i && i < LAST ? '…' : '');
    const live = Recorder.live && Recorder.page === i;
    return `<div class="rec" data-page="${i}"><div><div class="who"><b>${name}</b>${esc(first)}</div><div class="st">${live ? 'Recording…' : e ? `Recorded · ${fmt(e.duration)}` : 'Not recorded yet'}</div></div>
      <div class="tools"><button class="mini rec-btn${live ? ' live' : ''}" data-rec="${i}" aria-label="${live ? 'Stop recording' : 'Record ' + name}" ${Recorder.live && !live ? 'disabled' : ''}>${live ? ICON.stop : ICON.mic}</button><button class="mini" data-play="${i}" aria-label="Play recording" ${e ? '' : 'disabled'}>${ICON.play}</button><button class="mini" data-del="${i}" aria-label="Delete recording" ${e ? '' : 'disabled'}>${ICON.trash}</button></div></div>`;
  }).join('');
}
$('#recList').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.rec != null) {
    const i = +b.dataset.rec; Sound.ensure();
    if (Recorder.live) { const entry = await Recorder.stop(); clearInterval(recTimer); $('#prompter').hidden = true; renderRecList(); if (entry && entry.duration > 0.5) { toast(`Saved. ${i === 0 ? 'The cover' : i === LAST ? 'The end' : 'Page ' + i} now reads in your voice.`); if (settings.narrator !== 'dad') { settings.narrator = 'dad'; save(); syncSettingsUI(); } } else toast('That recording was too short. Try again.'); return; }
    try { await Recorder.start(i); } catch (err) { toast(err.message || 'Could not start the microphone.'); return; }
    const pr = $('#prompter'); pr.hidden = false; const t0 = Date.now();
    pr.innerHTML = `<div class="meta"><span>Recording ${i === 0 ? 'the cover' : i === LAST ? 'the end' : 'page ' + i} — read this aloud</span><span class="time">0:00</span></div><div class="txt">${PAGES[i].lines.map(l => esc(l.text)).join('<br>')}</div><div class="meta"><span>Tap ■ when you finish</span></div>`;
    recTimer = setInterval(() => { $('.time', pr).textContent = fmt((Date.now() - t0) / 1000); }, 250);
    renderRecList(); pr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else if (b.dataset.play != null) {
    const e2 = recCache.get(+b.dataset.play); if (!e2) return; if (previewAudio) previewAudio.pause(); if (!e2.url) e2.url = URL.createObjectURL(e2.blob); previewAudio = new Audio(e2.url); previewAudio.play().catch(() => toast('Could not play that recording.'));
  } else if (b.dataset.del != null) {
    const i = +b.dataset.del; if (!confirm(`Delete the recording for ${i === 0 ? 'the cover' : i === LAST ? 'the end' : 'page ' + i}?`)) return;
    const e2 = recCache.get(i); if (e2 && e2.url) URL.revokeObjectURL(e2.url); recCache.delete(i); try { await DB.del(i); } catch {} renderRecList();
  }
});

/* ---------- boot ---------- */
loadRecordings().finally(() => { go(0, 1); });
if (settings.motion && 'DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function') enableTilt();
document.addEventListener('pointerdown', () => { if (settings.motion) enableTilt(); }, { once: true });
})();
