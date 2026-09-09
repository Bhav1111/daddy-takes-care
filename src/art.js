/* ===== Illustration kit for "Daddy Takes Care" — original cut-paper style SVG art =====
   Every layer is an SVG in a 1000x1000 space (safe zone x 120-880, y 130-870). Colors come from
   CSS tokens (fill="--skin" becomes style="fill:var(--skin)") so skin and clothing can be retuned. */
const Art = (() => {
  let uidN = 0;
  const uid = (p = 'g') => `${p}${(++uidN).toString(36)}`;
  const n = v => Math.round(v * 100) / 100;
  const fl = f => f.startsWith('--') ? `style="fill:var(${f})"` : `fill="${f}"`;
  const st = s => s.startsWith('--') ? `style="stroke:var(${s})"` : `stroke="${s}"`;
  const P = (d, f, x = '') => `<path d="${d}" ${fl(f)} ${x}/>`;
  const C = (cx, cy, r, f, x = '') => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" ${fl(f)} ${x}/>`;
  const E = (cx, cy, rx, ry, f, x = '') => `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" ${fl(f)} ${x}/>`;
  const R = (x, y, w, h, r, f, ex = '') => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" ${fl(f)} ${ex}/>`;
  const L = (x1, y1, x2, y2, s, w, x = '') => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${st(s)} stroke-width="${n(w)}" stroke-linecap="round" ${x}/>`;
  const G = (inner, attrs = '') => `<g ${attrs}>${inner}</g>`;
  const A = (cls, inner, x, y, s = 1, rot = 0) => G(G(inner, `class="${cls}"`), at(x, y, s, rot));
  const at = (x, y, s = 1, rot = 0) => `transform="translate(${n(x)} ${n(y)}) rotate(${rot}) scale(${s})"`;
  const arc = (x, y, w, bend, s, sw) => `<path d="M ${n(x)},${n(y)} q ${n(w / 2)},${n(bend)} ${n(w)},0" fill="none" ${st(s)} stroke-width="${n(sw)}" stroke-linecap="round"/>`;
  const limb = (x1, y1, x2, y2, w, color, hand, hr = 13) => L(x1, y1, x2, y2, color, w) + (hand ? C(x2, y2, hr, hand) : '');
  const text = (x, y, s, str, f, ex = '') => `<text x="${n(x)}" y="${n(y)}" font-size="${s}" font-family="Fredoka, Nunito, sans-serif" font-weight="600" text-anchor="middle" ${fl(f)} ${ex}>${str}</text>`;
  const radial = (id, stops) => `<radialGradient id="${id}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join('')}</radialGradient>`;
  const linear = (id, stops, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join('')}</linearGradient>`;
  // deterministic pseudo-random
  const rng = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  /* ---------- faces ---------- */
  function features(r, k, eye, mouth, look) {
    const lx = (look && look.x || 0) * r, ly = (look && look.y || 0) * r;
    let s = '';
    const ey = -r * 0.06, ex = r * 0.36;
    for (const sx of [-ex, ex]) {
      if (eye === 'open' || eye === 'sleepy') {
        s += E(sx, ey, r * (k ? 0.13 : 0.17), r * (k ? 0.15 : 0.2), '#fff');
        s += C(sx + lx, ey + ly + (eye === 'sleepy' ? r * 0.05 : 0), r * (k ? 0.075 : 0.105), '--eye');
        s += C(sx + lx - r * 0.035, ey + ly - r * 0.05 + (eye === 'sleepy' ? r * 0.05 : 0), r * 0.035, '#fff');
        if (eye === 'sleepy') s += E(sx, ey - r * 0.11, r * (k ? 0.15 : 0.19), r * 0.13, '--skin') + arc(sx - r * 0.17, ey - r * 0.01, r * 0.34, r * 0.06, '--hair', r * 0.05);
      } else if (eye === 'sleep') {
        s += arc(sx - r * 0.16, ey + r * 0.02, r * 0.32, r * 0.13, '--hair', r * 0.06);
      } else if (eye === 'happy') {
        s += arc(sx - r * 0.16, ey + r * 0.07, r * 0.32, -r * 0.15, '--hair', r * 0.06);
      }
    }
    const y0 = r * (k ? 0.46 : 0.42);
    switch (mouth) {
      case 'smile': s += arc(-r * 0.18, y0, r * 0.36, r * 0.18, '--mouth', r * 0.055); break;
      case 'bigsmile': s += arc(-r * 0.26, y0 - r * 0.02, r * 0.52, r * 0.26, '--mouth', r * 0.06); break;
      case 'grin': s += P(`M ${n(-r * 0.24)},${n(y0)} Q 0,${n(y0 + r * 0.34)} ${n(r * 0.24)},${n(y0)} Z`, '--mouth') + E(0, y0 + r * 0.12, r * 0.08, r * 0.05, '--tongue'); break;
      case 'tongue': s += arc(-r * 0.18, y0, r * 0.36, r * 0.18, '--mouth', r * 0.055) + E(0, y0 + r * 0.14, r * 0.09, r * 0.12, '--tongue') + L(0, y0 + r * 0.1, 0, y0 + r * 0.22, '#D9667A', r * 0.03); break;
      case 'o': s += E(0, y0 + r * 0.04, r * 0.09, r * 0.11, '--mouth'); break;
      case 'yawn': s += E(0, y0 + r * 0.06, r * 0.12, r * 0.15, '--mouth') + E(0, y0 + r * 0.13, r * 0.07, r * 0.05, '--tongue'); break;
      case 'small': s += arc(-r * 0.1, y0, r * 0.2, r * 0.08, '--mouth', r * 0.05); break;
      case 'kiss': s += E(0, y0 + r * 0.02, r * 0.07, r * 0.06, '--mouth') + arc(-r * 0.05, y0 - r * 0.05, r * 0.1, -r * 0.03, '--mouth', r * 0.03); break;
      case 'chew': s += arc(-r * 0.14, y0 + r * 0.02, r * 0.28, r * 0.06, '--mouth', r * 0.06); break;
    }
    return s;
  }
  function face(o) {
    const r = o.r || 60, k = o.kind === 'dad';
    let s = k ? E(0, 0, r * 0.95, r * 1.05, '--skin') : C(0, 0, r, '--skin');
    s += C(-r * 0.97, r * 0.06, r * 0.17, '--skin') + C(r * 0.97, r * 0.06, r * 0.17, '--skin');
    s += C(-r * 0.97, r * 0.06, r * 0.08, '--skin2', 'opacity=".45"') + C(r * 0.97, r * 0.06, r * 0.08, '--skin2', 'opacity=".45"');
    if (k) {
      s += P(`M ${n(-r * 0.98)},${n(-r * 0.15)} Q ${n(-r * 0.95)},${n(-r * 1.22)} 0,${n(-r * 1.16)} Q ${n(r * 0.95)},${n(-r * 1.22)} ${n(r * 0.98)},${n(-r * 0.15)} Q ${n(r * 0.75)},${n(-r * 0.58)} ${n(r * 0.3)},${n(-r * 0.66)} Q 0,${n(-r * 0.5)} ${n(-r * 0.3)},${n(-r * 0.66)} Q ${n(-r * 0.75)},${n(-r * 0.58)} ${n(-r * 0.98)},${n(-r * 0.15)} Z`, '--hair');
      s += P(`M ${n(-r * 0.78)},${n(r * 0.3)} Q 0,${n(r * 1.36)} ${n(r * 0.78)},${n(r * 0.3)} Q ${n(r * 0.6)},${n(r * 0.98)} 0,${n(r * 1.03)} Q ${n(-r * 0.6)},${n(r * 0.98)} ${n(-r * 0.78)},${n(r * 0.3)} Z`, '--hair', 'opacity=".2"');
      s += arc(-r * 0.52, -r * 0.4, r * 0.3, -r * 0.09, '--hair', r * 0.075) + arc(r * 0.22, -r * 0.4, r * 0.3, -r * 0.09, '--hair', r * 0.075);
    } else {
      s += `<path d="M ${n(-r * 0.06)},${n(-r * 0.97)} q ${n(r * 0.1)},${n(-r * 0.4)} ${n(r * 0.38)},${n(-r * 0.3)} q ${n(-r * 0.16)},${n(r * 0.05)} ${n(-r * 0.14)},${n(r * 0.26)}" fill="none" style="stroke:var(--hair)" stroke-width="${n(r * 0.09)}" stroke-linecap="round"/>`;
      s += arc(-r * 0.5, -r * 0.36, r * 0.26, -r * 0.05, '--hair', r * 0.035, 'opacity=".6"') + arc(r * 0.24, -r * 0.36, r * 0.26, -r * 0.05, '--hair', r * 0.035);
    }
    s += C(-r * 0.62, r * 0.22, r * (k ? 0.1 : 0.14), '--cheek', 'opacity=".5"') + C(r * 0.62, r * 0.22, r * (k ? 0.1 : 0.14), '--cheek', 'opacity=".5"');
    s += arc(-r * 0.06, r * 0.16, r * 0.12, r * 0.07, '--skin2', r * 0.05);
    s += G(features(r, k, o.eyes || 'open', o.mouth || 'smile', o.look), 'class="fa"');
    if (o.alt) s += G(features(r, k, o.alt.eyes || o.eyes || 'open', o.alt.mouth || o.mouth || 'smile', o.alt.look || o.look), 'class="fb"');
    return G(s, 'class="face"');
  }
  const babyFace = o => face({ r: 60, ...o });
  const dadFace = o => face({ r: 52, kind: 'dad', ...o });

  /* ---------- baby poses (head center at 0,0) ---------- */
  const onesieSnaps = (y0) => C(0, y0, 4, '#fff') + C(0, y0 + 24, 4, '#fff') + C(0, y0 + 48, 4, '#fff');
  function babySit(o = {}) {
    const cl = o.cloth || '--onesie';
    let s = limb(-30, 138, -66, 176, 30, cl) + C(-70, 182, 16, '--skin') + limb(30, 138, 66, 176, 30, cl) + C(70, 182, 16, '--skin');
    s += R(-52, 44, 104, 112, 44, cl) + E(0, 50, 20, 9, '#fff', 'opacity=".9"') + onesieSnaps(86);
    let arms = '';
    if (o.arms === 'up') arms = limb(-50, 80, -96, 10, 24, cl) + C(-100, 2, 13, '--skin') + limb(50, 80, 96, 10, 24, cl) + C(100, 2, 13, '--skin');
    else if (o.arms === 'reach') arms = limb(-50, 80, -92, 118, 24, cl) + C(-96, 124, 13, '--skin') + G(limb(50, 80, 140, 50, 24, cl) + C(146, 46, 13, '--skin'), 'class="reach"');
    else if (o.arms === 'wide') arms = limb(-50, 80, -112, 40, 24, cl) + C(-118, 34, 13, '--skin') + limb(50, 80, 112, 40, 24, cl) + C(118, 34, 13, '--skin');
    else arms = limb(-50, 80, -92, 118, 24, cl) + C(-96, 124, 13, '--skin') + limb(50, 80, 92, 118, 24, cl) + C(96, 124, 13, '--skin');
    s += G(arms, 'class="arms"');
    s += babyFace(o);
    return G(s, 'class="baby" data-tap="baby"');
  }
  function babyLying(o = {}) {
    const cl = o.cloth || '--onesie';
    let s = R(36, -44, 150, 88, 44, cl) + onesieSnaps(-12).replace(/cx="0"/g, 'cx="120"');
    s += G(limb(160, -10, 232, -52, 30, cl) + C(238, -56, 16, '--skin'), 'class="stretch"');
    s += limb(160, 22, 214, 58, 30, cl) + C(218, 64, 16, '--skin');
    s += limb(70, 34, 104, 70, 24, cl) + C(108, 74, 13, '--skin');
    s += babyFace({ mouth: 'small', ...o });
    s += G(limb(52, -6, 10, 30, 24, cl) + C(4, 30, 14, '--skin') + C(-6, 20, 7, '--skin'), 'class="thumb"');
    return G(s, 'class="baby" data-tap="baby"');
  }
  function babyChair(o = {}) {
    const cl = o.cloth || '--onesie';
    let s = R(-52, 44, 104, 100, 44, cl);
    s += P('M -46,50 Q -54,120 0,150 Q 54,120 46,50 Q 0,72 -46,50 Z', '#fff') + P(heartPath(9), '#F28CA6', 'transform="translate(0 108)" opacity=".8"');
    s += G(C(-16, 118, 10, '#F5A24C') + C(4, 130, 7, '#F5A24C') + C(-24, 136, 5, '#F5A24C') + C(14, 112, 4, '#F5A24C'), 'class="splat"');
    s += limb(-50, 82, -68, 128, 24, cl) + C(-70, 134, 13, '--skin') + limb(50, 82, 68, 128, 24, cl) + C(70, 134, 13, '--skin');
    s += babyFace(o);
    return G(s, 'class="baby" data-tap="baby"');
  }
  function babyTummy(o = {}) {
    const cl = o.cloth || '--onesie';
    let s = R(30, -18, 160, 74, 37, cl);
    s += G(limb(170, 0, 236, -40, 30, cl) + C(242, -44, 16, '--skin'), 'class="kick"') + limb(170, 26, 240, 30, 30, cl) + C(246, 32, 16, '--skin');
    s += limb(40, 36, -4, 72, 24, cl) + C(-10, 76, 13, '--skin') + limb(28, 26, -26, 58, 24, cl) + C(-32, 62, 13, '--skin');
    s += G(babyFace(o), 'transform="rotate(-8)"');
    return G(s, 'class="baby" data-tap="baby"');
  }
  function babyHeld(o = {}) {
    let s = P('M -50,44 Q -66,150 -44,208 L 44,208 Q 66,150 50,44 Q 0,60 -50,44 Z', '--sack');
    s += P(starPath(7), '#fff', 'transform="translate(-14 118)" opacity=".7"') + P(starPath(6), '#fff', 'transform="translate(22 160)" opacity=".7"') + P(starPath(5), '#fff', 'transform="translate(-6 186)" opacity=".6"');
    if (o.arms === 'rub') s += limb(46, 72, 76, 102, 22, '--skin') + C(80, 106, 12, '--skin');
    else if (o.arms === 'bottle') s += limb(-46, 72, -20, 108, 22, '--skin') + C(-16, 112, 12, '--skin');
    else s += limb(-46, 72, -74, 98, 22, '--skin') + C(-78, 102, 12, '--skin') + limb(46, 72, 74, 98, 22, '--skin') + C(78, 102, 12, '--skin');
    s += babyFace(o);
    if (o.arms === 'rub') s += G(limb(-46, 72, -30, 0, 22, '--skin') + C(-26, -6, 13, '--skin'), 'class="rub"');
    if (o.arms === 'bottle') s += limb(46, 72, 30, 40, 22, '--skin') + C(28, 34, 12, '--skin');
    return G(s, 'class="baby" data-tap="baby"');
  }
  function babyAsleep(o = {}) {
    let s = R(38, -46, 190, 92, 46, '--sack') + P(starPath(7), '#fff', 'transform="translate(110 -10)" opacity=".7"') + P(starPath(6), '#fff', 'transform="translate(170 14)" opacity=".7"');
    s += limb(44, -30, 22, -84, 22, '--skin') + C(18, -90, 12, '--skin');
    s += G(babyFace({ eyes: 'sleep', mouth: 'small', ...o }), 'transform="rotate(10)"');
    return G(s, 'class="baby" data-tap="baby"');
  }

  /* ---------- dad poses (head center at 0,0) ---------- */
  const dadTorso = (h = 152) => R(-64, 58, 128, h, 44, '--shirt') + P('M -20,60 L 0,94 L 20,60 Z', '--skin') + P('M -30,56 L -20,60 L 0,94 L 20,60 L 30,56 L 0,68 Z', '--shirt2');
  const dadLegs = () => R(-58, 196, 54, 150, 24, '--pants') + R(4, 196, 54, 150, 24, '--pants') + E(-34, 352, 38, 15, '--shoe') + E(30, 352, 38, 15, '--shoe');
  function dadStand(o = {}) {
    let s = dadLegs() + dadTorso();
    const arms = o.arms || 'down';
    if (arms === 'down') s += limb(-62, 92, -84, 208, 32, '--shirt') + C(-86, 216, 18, '--skin') + limb(62, 92, 84, 208, 32, '--shirt') + C(86, 216, 18, '--skin');
    if (arms === 'wave') s += limb(-62, 92, -84, 208, 32, '--shirt') + C(-86, 216, 18, '--skin') + G(limb(62, 92, 112, 10, 32, '--shirt') + C(116, 0, 18, '--skin'), 'class="wave"');
    if (arms === 'lift') s += limb(-62, 92, -46, -150, 32, '--shirt') + C(-46, -156, 18, '--skin') + limb(62, 92, 46, -150, 32, '--shirt') + C(46, -156, 18, '--skin');
    if (arms === 'kiss') s += limb(-62, 92, -110, 190, 32, '--shirt') + C(-114, 198, 18, '--skin') + limb(62, 92, 96, 200, 32, '--shirt') + C(100, 208, 18, '--skin');
    s += dadFace(o);
    return G(s, 'class="dad" data-tap="dad"');
  }
  function dadPeek(o = {}) {
    return G(R(-64, 58, 128, 120, 44, '--shirt') + P('M -20,60 L 0,94 L 20,60 Z', '--skin') + dadFace({ eyes: 'happy', mouth: 'bigsmile', ...o }), 'class="dad" data-tap="dad"');
  }
  function dadTummy(o = {}) {
    let s = R(200, -6, 190, 72, 36, '--pants') + E(390, 30, 20, 34, '--shoe', 'transform="rotate(-20 390 30)"');
    s += R(30, -12, 200, 84, 42, '--shirt');
    s += dadFace({ eyes: 'open', mouth: 'bigsmile', ...o });
    s += limb(-70, 90, -24, 56, 30, '--shirt') + C(-22, 54, 17, '--skin') + limb(70, 90, 24, 56, 30, '--shirt') + C(22, 54, 17, '--skin');
    return G(s, 'class="dad" data-tap="dad"');
  }
  function dadDance(o = {}) {
    let s = limb(-28, 200, -74, 322, 46, '--pants') + E(-84, 340, 40, 15, '--shoe') + limb(28, 200, 76, 322, 46, '--pants') + E(86, 340, 40, 15, '--shoe');
    s += G(dadTorso(), 'transform="rotate(-5)"');
    s += limb(-62, 92, -124, -8, 32, '--shirt') + C(-128, -16, 18, '--skin') + limb(62, 92, 128, -16, 32, '--shirt') + C(132, -24, 18, '--skin');
    s += G(dadFace({ eyes: 'happy', mouth: 'grin', ...o }), 'transform="rotate(8)"');
    return G(s, 'class="dad" data-tap="dad"');
  }
  function dadSit(o = {}) {
    let s = R(-72, 176, 144, 64, 32, '--pants') + R(-62, 226, 52, 96, 24, '--pants') + R(10, 226, 52, 96, 24, '--pants') + E(-36, 326, 38, 15, '--shoe') + E(36, 326, 38, 15, '--shoe');
    s += dadTorso(130);
    s += limb(62, 92, 66, 176, 32, '--shirt');
    s += dadFace({ eyes: 'sleepy', mouth: 'smile', ...o });
    return G(s, 'class="dad" data-tap="dad"');
  }
  function dadHoldShoulder(o = {}) {
    let s = dadLegs() + dadTorso() + limb(-62, 92, -60, 200, 32, '--shirt') + C(-62, 208, 18, '--skin');
    s += dadFace({ eyes: 'sleepy', mouth: 'smile', ...o });
    s += G(babyHeld({ eyes: 'sleepy', mouth: 'small', arms: 'rub', alt: o.babyAlt }), 'transform="translate(-70 -6) scale(.78)"');
    s += limb(62, 92, -30, 118, 32, '--shirt') + C(-36, 122, 18, '--skin');
    return G(s, 'class="dad" data-tap="dad"');
  }
  function dadCradle(o = {}) {
    let s = R(-72, 176, 144, 64, 32, '--pants') + R(-62, 226, 52, 96, 24, '--pants') + R(10, 226, 52, 96, 24, '--pants') + E(-36, 326, 38, 15, '--shoe') + E(36, 326, 38, 15, '--shoe');
    s += dadTorso(130) + limb(-62, 92, -96, 150, 32, '--shirt') + C(-100, 156, 18, '--skin');
    s += dadFace({ eyes: 'sleepy', mouth: 'smile', ...o });
    s += G(babyHeld({ eyes: 'sleepy', mouth: 'o', arms: 'bottle', alt: { eyes: 'sleep', mouth: 'small' } }), 'transform="translate(-40 118) rotate(-62) scale(.74)"');
    s += G(G(bottle(), 'class="bottle"'), 'transform="translate(6 96) rotate(-40)"');
    s += limb(62, 92, 30, 178, 32, '--shirt') + C(26, 186, 18, '--skin');
    return G(s, 'class="dad" data-tap="dad"');
  }

  /* ---------- small shapes ---------- */
  function heartPath(s) { return `M 0,${n(s * 0.4)} C ${n(-s * 1.1)},${n(-s * 0.35)} ${n(-s * 0.55)},${n(-s * 1.15)} 0,${n(-s * 0.45)} C ${n(s * 0.55)},${n(-s * 1.15)} ${n(s * 1.1)},${n(-s * 0.35)} 0,${n(s * 0.4)} Z`; }
  function starPath(s) { return `M 0,${n(-s)} L ${n(s * 0.28)},${n(-s * 0.28)} L ${n(s)},0 L ${n(s * 0.28)},${n(s * 0.28)} L 0,${n(s)} L ${n(-s * 0.28)},${n(s * 0.28)} L ${n(-s)},0 L ${n(-s * 0.28)},${n(-s * 0.28)} Z`; }
  function star5(s) { let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.45 : s, a = -Math.PI / 2 + i * Math.PI / 5; d += (i ? 'L' : 'M') + n(Math.cos(a) * r) + ',' + n(Math.sin(a) * r) + ' '; } return d + 'Z'; }
  function note(s, f) { return G(E(0, 0, s * 0.55, s * 0.4, f, 'transform="rotate(-20)"') + L(s * 0.5, -s * 0.1, s * 0.5, -s * 1.7, f, s * 0.22) + P(`M ${n(s * 0.5)},${n(-s * 1.7)} q ${n(s * 0.7)},${n(s * 0.2)} ${n(s * 0.5)},${n(s * 0.9)} q 0,${n(-s * 0.5)} ${n(-s * 0.5)},${n(-s * 0.5)} Z`, f)); }
  function bottle() { return R(-16, -44, 32, 84, 10, '#fff', 'opacity=".92"') + R(-13, -8, 26, 44, 8, '#FFF3D6') + R(-20, -52, 40, 14, 5, '#F7B1C2') + P('M -9,-52 q 9,-26 18,0 Z', '#F2C4A0'); }
  function bunny(x, y, s) {
    return G(E(0, 40, 34, 28, '#F6EDE4') + E(-14, -30, 9, 26, '#F6EDE4') + E(14, -30, 9, 26, '#F6EDE4') + E(-14, -30, 4, 16, '#F6C9CF') + E(14, -30, 4, 16, '#F6C9CF') + C(0, 0, 28, '#F6EDE4') + C(-9, -3, 3, '--eye') + C(9, -3, 3, '--eye') + E(0, 6, 4, 3, '#E89BAA') + C(-14, 6, 5, '--cheek', 'opacity=".5"') + C(14, 6, 5, '--cheek', 'opacity=".5"'), at(x, y, s));
  }
  function cloud(x, y, s, f, cls = '') { const b = E(0, 12, 64, 26, f) + C(-32, 0, 28, f) + C(4, -14, 36, f) + C(40, 2, 26, f); return G(cls ? G(b, `class="${cls}"`) : b, at(x, y, s)); }
  function sun(x, y, r, f = '#FFD24A', rays = true) {
    let s = '';
    if (rays) { let d = ''; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; d += `M ${n(Math.cos(a) * r * 1.25)},${n(Math.sin(a) * r * 1.25)} L ${n(Math.cos(a + 0.18) * r * 1.9)},${n(Math.sin(a + 0.18) * r * 1.9)} L ${n(Math.cos(a - 0.18) * r * 1.9)},${n(Math.sin(a - 0.18) * r * 1.9)} Z `; } s += G(P(d, f, 'opacity=".55"'), 'class="anim-spin"'); }
    s += C(0, 0, r, f) + C(-r * 0.25, -r * 0.25, r * 0.28, '#fff', 'opacity=".35"');
    return G(s, at(x, y));
  }
  function moon(x, y, r, bg) {
    const id = uid('mg');
    return `<defs>${radial(id, [[0, '#FFF1C2', 0.55], [0.5, '#FFF1C2', 0.12], [1, '#FFF1C2', 0]])}</defs>` + C(x, y, r * 2.6, `url(#${id})`) + C(x, y, r, '#FFF2C4') + C(x + r * 0.42, y - r * 0.18, r * 0.82, bg);
  }
  function starsField(seed, count, x0, y0, w, h, size = 7, f = '#FFF6D6') {
    const r = rng(seed); let s = '';
    for (let i = 0; i < count; i++) {
      const x = x0 + r() * w, y = y0 + r() * h, sz = size * (0.5 + r()), d = (r() * 3).toFixed(2);
      s += G(G(P(starPath(sz), f), `class="anim-twinkle" style="animation-delay:-${d}s"`), `transform="translate(${n(x)} ${n(y)})"`);
    }
    return s;
  }
  function zzz(x, y, s = 1) {
    return G([0, 1, 2].map(i => `<text x="${i * 34}" y="${-i * 40}" font-size="${34 + i * 12}" font-family="Fredoka, sans-serif" font-weight="700" fill="#FFF5D6" class="anim-zz" style="animation-delay:${i * 0.5}s">z</text>`).join(''), at(x, y, s));
  }
  function hearts(x, y, s, f = '#F26D85') {
    return G([[0, 0, 1], [-40, -60, 0.7], [44, -50, 0.8]].map(([dx, dy, k], i) => G(G(P(heartPath(16 * k), f), `class="anim-float" style="animation-delay:${i * 0.7}s"`), `transform="translate(${dx} ${dy})"`)).join(''), at(x, y, s));
  }
  function notes(x, y, s, f = '#4F5BB8') {
    return G([[0, 0, 1], [-60, -40, 0.8], [50, -70, 0.9], [-20, -120, 0.7]].map(([dx, dy, k], i) => G(G(note(18 * k, f), `class="anim-float" style="animation-delay:${i * 0.6}s"`), `transform="translate(${dx} ${dy})"`)).join(''), at(x, y, s));
  }
  function plant(x, y, s, pot = '#D98A5B', leaf = '#5FA97A') {
    let l = ''; for (let i = -2; i <= 2; i++) l += E(i * 14, -44 + Math.abs(i) * 10, 12, 40, leaf, `transform="rotate(${i * 22} ${i * 14} -20)"`);
    return G(l + P('M -34,0 L 34,0 L 26,60 L -26,60 Z', pot) + R(-38, -6, 76, 14, 6, pot), at(x, y, s));
  }

  /* ---------- room props ---------- */
  function wall(o) {
    const id = uid('pt');
    let s = R(-400, -400, 1800, 1800, 0, o.color);
    if (o.dots) s += `<defs><pattern id="${id}" width="96" height="96" patternUnits="userSpaceOnUse"><circle cx="24" cy="24" r="6" fill="${o.dots}"/><circle cx="72" cy="72" r="6" fill="${o.dots}"/></pattern></defs>` + `<rect x="-400" y="-400" width="1800" height="${n(o.floorY + 400)}" fill="url(#${id})" opacity=".5"/>`;
    if (o.stripes) { let st = ''; for (let x = -400; x < 1400; x += 80) st += R(x, -400, 34, o.floorY + 400, 0, o.stripes); s += G(st, 'opacity=".35"'); }
    s += R(-400, o.floorY - 16, 1800, 18, 0, o.trim || '#fff') + R(-400, o.floorY, 1800, 900, 0, o.floor);
    if (o.planks) { let pl = ''; for (let y = o.floorY + 40; y < 1300; y += 46) pl += L(-400, y, 1400, y, o.planks, 3); s += G(pl, 'opacity=".5"'); }
    return s;
  }
  function rug(x, y, rx, ry, f, f2) { return E(x, y, rx, ry, f) + E(x, y, rx * 0.8, ry * 0.8, 'none', `stroke="${f2}" stroke-width="10" stroke-dasharray="28 18"`) + E(x, y, rx * 0.5, ry * 0.5, f2, 'opacity=".5"'); }
  function windowDay(x, y, w, h, o = {}) {
    const id = uid('sk');
    let s = `<defs>${linear(id, [[0, o.top || '#9ED7F2'], [1, o.bottom || '#FCE6C5']])}</defs>`;
    s += R(x - 16, y - 16, w + 32, h + 32, 20, o.frame || '#FFFFFF') + R(x, y, w, h, 8, `url(#${id})`);
    const cid = uid('wc');
    s += `<defs><clipPath id="${cid}">${R(x, y, w, h, 8, '#000')}</clipPath></defs><g clip-path="url(#${cid})">` + cloud(x + w * 0.72, y + h * 0.28, 0.5, '#fff', 'anim-drift') + cloud(x + w * 0.22, y + h * 0.5, 0.42, '#fff', 'anim-drift2') + '</g>';
    s += sun(x + w * 0.32, y + h * 0.36, w * 0.13, '#FFD24A');
    s += P(`M ${n(x)},${n(y + h)} Q ${n(x + w * 0.3)},${n(y + h * 0.7)} ${n(x + w * 0.6)},${n(y + h * 0.86)} Q ${n(x + w * 0.85)},${n(y + h * 0.96)} ${n(x + w)},${n(y + h * 0.8)} L ${n(x + w)},${n(y + h)} Z`, o.hill || '#8FCB8A');
    s += L(x + w / 2, y, x + w / 2, y + h, o.frame || '#fff', 12) + L(x, y + h / 2, x + w, y + h / 2, o.frame || '#fff', 12);
    s += R(x - 34, y + h + 10, w + 68, 20, 8, o.frame || '#fff');
    return s;
  }
  function windowNight(x, y, w, h, o = {}) {
    const id = uid('nk'), bg = o.bottom || '#2B3672';
    let s = `<defs>${linear(id, [[0, o.top || '#141B45'], [1, bg]])}</defs>`;
    s += R(x - 16, y - 16, w + 32, h + 32, 20, o.frame || '#CFC8E6') + R(x, y, w, h, 8, `url(#${id})`);
    s += starsField(o.seed || 3, 9, x + 10, y + 10, w - 20, h * 0.7, 6);
    s += moon(x + w * 0.66, y + h * 0.3, w * 0.11, bg);
    s += P(`M ${n(x)},${n(y + h)} Q ${n(x + w * 0.3)},${n(y + h * 0.72)} ${n(x + w * 0.6)},${n(y + h * 0.88)} Q ${n(x + w * 0.85)},${n(y + h * 0.98)} ${n(x + w)},${n(y + h * 0.82)} L ${n(x + w)},${n(y + h)} Z`, '#1A1F4A');
    s += L(x + w / 2, y, x + w / 2, y + h, o.frame || '#CFC8E6', 12) + L(x, y + h / 2, x + w, y + h / 2, o.frame || '#CFC8E6', 12);
    s += R(x - 34, y + h + 10, w + 68, 20, 8, o.frame || '#CFC8E6');
    return s;
  }
  function curtains(x, y, w, h, f) {
    const left = P(`M ${n(x - 40)},${n(y - 30)} L ${n(x + 70)},${n(y - 30)} Q ${n(x + 96)},${n(y + h * 0.5)} ${n(x + 56)},${n(y + h + 30)} Q ${n(x + 10)},${n(y + h * 0.65)} ${n(x - 40)},${n(y + h + 30)} Z`, f);
    const right = P(`M ${n(x + w + 40)},${n(y - 30)} L ${n(x + w - 70)},${n(y - 30)} Q ${n(x + w - 96)},${n(y + h * 0.5)} ${n(x + w - 56)},${n(y + h + 30)} Q ${n(x + w - 10)},${n(y + h * 0.65)} ${n(x + w + 40)},${n(y + h + 30)} Z`, f);
    return G(left + right, 'class="anim-sway-soft"') + R(x - 60, y - 44, w + 120, 22, 11, f);
  }
  function cribRail(x, y, w, h, wood, front) {
    let s = R(x - 14, y - 24, 28, h + (front ? 150 : 60), 10, wood) + R(x + w - 14, y - 24, 28, h + (front ? 150 : 60), 10, wood);
    let slats = ''; const count = Math.round(w / 52);
    for (let i = 1; i < count; i++) slats += L(x + (w * i) / count, y + 14, x + (w * i) / count, y + h - 14, wood, 11);
    s += slats + R(x - 10, y, w + 20, 20, 10, wood) + R(x - 10, y + h - 20, w + 20, 20, 10, wood);
    if (front) s += C(x, y - 30, 16, wood) + C(x + w, y - 30, 16, wood);
    return s;
  }
  function mattress(x, y, w, h, f = '#FDEBD0', f2 = '#F6C9CF') { return R(x, y, w, h, 18, f) + R(x + 20, y + 14, w - 40, 10, 5, f2, 'opacity=".7"'); }
  function mobile(x, y) {
    const wood = '#B98A5E';
    let hang = '';
    const items = [[-70, 60, 'cloud'], [-20, 96, 'star'], [30, 70, 'moon'], [70, 104, 'star']];
    items.forEach(([dx, dy, k], i) => {
      let shape = k === 'star' ? P(star5(18), '#FFD24A') : k === 'moon' ? (C(0, 0, 18, '#FFF1C2') + C(9, -5, 15, 'var(--mobile-bg,#FFF8EE)')) : cloud(0, 0, 0.3, '#fff');
      hang += G(G(L(0, 0, 0, dy, wood, 3) + G(shape, `transform="translate(0 ${dy + 14})"`), `class="anim-bob" style="animation-delay:${i * 0.4}s"`), `transform="translate(${dx} 6)"`);
    });
    return G(G(L(0, -600, 0, -8, wood, 4) + E(0, 0, 100, 14, 'none', `stroke="${wood}" stroke-width="8"`) + hang, 'class="anim-sway" data-tap="mobile"'), at(x, y));
  }
  function door(x, y, w, h, o = {}) {
    let s = R(x - 18, y - 18, w + 36, h + 18, 12, o.trim || '#fff') + (o.hall === 'none' ? '' : R(x, y, w, h, 6, o.hall || '#3C3556'));
    if (o.open) s += P(`M ${n(x + w)},${n(y)} L ${n(x + w + w * 0.6)},${n(y + 34)} L ${n(x + w + w * 0.6)},${n(y + h - 26)} L ${n(x + w)},${n(y + h)} Z`, o.leaf || '#F4E8D8') + C(x + w + 20, y + h * 0.52, 8, '#C9A46A');
    return s;
  }
  function highchair(x, y, o = {}) {
    const wood = o.wood || '#C9986A', seat = o.seat || '#FFB27A';
    return { back: L(x - 60, y + 120, x - 100, y + 400, wood, 18) + L(x + 60, y + 120, x + 100, y + 400, wood, 18) + L(x - 82, y + 280, x + 82, y + 280, wood, 12) + R(x - 74, y - 80, 148, 180, 30, seat), tray: R(x - 120, y + 42, 240, 54, 22, wood) + R(x - 108, y + 50, 216, 22, 11, '#FFF4E6') };
  }
  function bowlSet(x, y) {
    return G(E(0, 4, 52, 18, '#E9DED0') + P('M -52,4 Q -46,42 0,46 Q 46,42 52,4 Z', '#F7F0E6') + E(0, 2, 44, 12, '#F5A24C') + C(-14, -2, 5, '#FFD27A') + C(12, 0, 4, '#FFD27A'), at(x, y));
  }
  function spoon(x, y) { return A('spoon', L(0, 0, 70, -46, '#C9C4D0', 9) + E(80, -54, 16, 12, '#D9D4E0', 'transform="rotate(-30 80 -54)"') + E(80, -54, 11, 7, '#F5A24C', 'transform="rotate(-30 80 -54)"'), x, y); }
  function shelf(x, y, w, wood = '#C9986A') { return R(x, y, w, 16, 8, wood) + R(x + 24, y - 62, 44, 62, 10, '#FFD27A') + R(x + 84, y - 48, 40, 48, 10, '#A9DAB8') + R(x + 140, y - 70, 46, 70, 10, '#F7B5A0') + plant(x + w - 50, y - 6, 0.55); }
  function sofa(x, y, w, f = '#8FB7D9', f2 = '#7AA3C8') { return R(x, y, w, 120, 44, f) + R(x - 26, y + 100, w + 52, 74, 30, f2) + R(x - 36, y + 50, 62, 130, 30, f2) + R(x + w - 26, y + 50, 62, 130, 30, f2) + R(x + 40, y + 24, 110, 80, 26, '#FFD27A') + R(x + w - 150, y + 24, 110, 80, 26, '#F7B5A0'); }
  function playmat(x, y) { return E(x, y, 340, 118, '#BFE8DA') + E(x, y, 260, 88, '#FFF', 'opacity=".35"') + E(x, y, 150, 50, '#FFD27A', 'opacity=".55"'); }
  function blocks(x, y) {
    const b = (dx, dy, f, ch) => G(R(-30, -30, 60, 60, 12, f) + text(0, 12, 34, ch, '#fff'), `transform="translate(${dx} ${dy})"`);
    return G(b(0, 0, '#F25F5C', 'A') + b(64, 4, '#4F9DDE', 'B') + b(32, -58, '#FFC83D', '★'), at(x, y));
  }
  function ball(x, y, r, f = '#F25F5C') { return G(G(C(0, 0, r, f) + P(`M ${n(-r * 0.95)},${n(-r * 0.3)} Q 0,${n(r * 0.3)} ${n(r * 0.95)},${n(-r * 0.3)} Q 0,${n(r * 0.75)} ${n(-r * 0.95)},${n(-r * 0.3)} Z`, '#fff', 'opacity=".9"') + C(-r * 0.35, -r * 0.4, r * 0.18, '#fff', 'opacity=".6"'), 'class="ball" data-tap="ball"'), at(x, y)); }
  function bookshelf(x, y, w, h, wood = '#6B4A3A') {
    const r = rng(11); let s = R(x, y, w, h, 12, wood);
    const cols = ['#E85D75', '#F2B84B', '#5BA8D6', '#7CC47F', '#B48BD9', '#FFF3D6'];
    for (let row = 0; row < 3; row++) {
      const sy = y + 24 + row * (h - 24) / 3, sh = (h - 24) / 3 - 22; let bx = x + 16;
      while (bx < x + w - 30) { const bw = 18 + r() * 22, bh = sh * (0.65 + r() * 0.35); s += R(bx, sy + sh - bh, bw, bh, 4, cols[Math.floor(r() * cols.length)]); bx += bw + 4; }
      s += R(x + 6, sy + sh, w - 12, 10, 4, '#8A6450');
    }
    return s;
  }
  function lamp(x, y, o = {}) {
    const id = uid('lg');
    return `<defs>${radial(id, [[0, '#FFE6A0', 0.75], [0.35, '#FFD98A', 0.32], [1, '#FFD98A', 0]])}</defs>` + C(x, y + 30, o.glow || 300, `url(#${id})`) + L(x, y + 60, x, y + 340, '#7A6A5A', 10) + E(x, y + 344, 50, 12, '#5E4F44') + P(`M ${n(x - 70)},${n(y + 60)} L ${n(x + 70)},${n(y + 60)} L ${n(x + 46)},${n(y - 60)} L ${n(x - 46)},${n(y - 60)} Z`, '#FFE1A8') + R(x - 72, y + 52, 144, 12, 6, '#F4C97A');
  }
  function rockingChair(x, y) {
    const wood = '#8C5A3C';
    return { back: A('anim-rock', R(-120, -170, 240, 210, 60, wood) + [-80, -40, 0, 40, 80].map(dx => L(dx, -140, dx, 10, '#A8704B', 12)).join('') + R(-130, 0, 260, 40, 16, wood), x, y), front: A('anim-rock', P('M -190,190 Q 0,260 190,190 Q 0,235 -190,190 Z', wood) + L(-120, 60, -120, 180, wood, 20) + L(120, 60, 120, 180, wood, 20) + R(-150, 46, 62, 22, 11, wood) + R(88, 46, 62, 22, 11, wood), x, y) };
  }
  function nightstand(x, y, wood = '#8C6A50') { return R(x - 64, y, 128, 130, 14, wood) + R(x - 46, y + 20, 92, 40, 8, '#A8836A') + C(x, y + 40, 7, '#F2D9B0') + R(x - 56, y + 130, 14, 30, 5, wood) + R(x + 42, y + 130, 14, 30, 5, wood); }
  function noiseMachine(x, y) {
    let dots = ''; for (let i = -2; i <= 2; i++) for (let j = 0; j < 2; j++) dots += C(i * 12, -18 + j * 12, 3, '#B9B3CC');
    const waves = [22, 36, 50].map((r, i) => `<path d="M ${r * 0.55},${-r * 0.8} A ${r},${r} 0 0 1 ${r * 0.55},${r * 0.2}" fill="none" stroke="#CBBDF2" stroke-width="5" stroke-linecap="round" class="anim-wave-ring" style="animation-delay:${i * 0.4}s"/>`).join('');
    return G(G(R(-40, -46, 80, 50, 18, '#F4EFF8') + dots + C(24, -12, 5, '#7CC47F') + G(waves, 'class="waves" transform="translate(30 -20)"'), 'class="noise" data-tap="noise"'), at(x, y));
  }
  function armchair(x, y, f = '#7C6AA8', f2 = '#6A5896') { return { back: G(R(-150, -180, 300, 240, 70, f), at(x, y)), front: G(R(-190, 0, 380, 120, 40, f2) + R(-200, -80, 70, 200, 32, f) + R(130, -80, 70, 200, 32, f), at(x, y)) }; }
  function frames(x, y) { return G(R(-60, -50, 120, 100, 10, '#D9C3A5') + R(-48, -38, 96, 76, 6, '#FFF8EC') + P(heartPath(22), '#F26D85') + R(140, -40, 100, 80, 10, '#D9C3A5') + R(150, -30, 80, 60, 6, '#FFF8EC') + C(190, 0, 14, '#FFD24A'), at(x, y)); }
  function thermostat(x, y) { return G(C(0, 0, 40, '#F4F1F8') + C(0, 0, 30, '#E4E0EE') + L(0, 0, 14, -18, '#5B5670', 5) + C(0, 0, 4, '#5B5670') + G(P(starPath(12), '#8CC8F5'), 'class="snow" transform="translate(0 -60)"'), at(x, y)); }
  function breeze(x, y) { return G([0, 1, 2].map(i => `<path d="M 0,${i * 40} q 40,-30 80,0 t 80,0" fill="none" stroke="#BFE3FF" stroke-width="7" stroke-linecap="round" class="anim-breeze" style="animation-delay:${i * 0.35}s"/>`).join(''), `class="breeze" ${at(x, y)}`); }
  function dreamBubble(x, y) {
    return G(G(C(-150, 130, 12, '#fff', 'opacity=".8"') + C(-120, 90, 20, '#fff', 'opacity=".85"') + C(0, 0, 100, '#fff') + C(-70, 30, 70, '#fff') + C(70, 30, 70, '#fff') + C(0, 40, 90, '#fff') + G(dadFace({ mouth: 'kiss', eyes: 'happy' }), 'transform="translate(-10 10) scale(.55)"') + G(G(P(heartPath(14), '#F26D85'), 'class="anim-float"'), 'transform="translate(52 -30)"') + G(G(P(heartPath(10), '#F26D85'), 'class="anim-float" style="animation-delay:.6s"'), 'transform="translate(-70 -20)"'), 'class="dream"'), at(x, y));
  }
  function house(x, y, s, lit = true) {
    return G(R(-110, -60, 220, 160, 14, '#F5E6CF') + P('M -130,-50 L 0,-150 L 130,-50 Z', '#C96B5A') + R(50, -130, 30, 60, 6, '#8C5A3C') + R(-20, 20, 40, 80, 20, '#8C5A3C') + R(-84, -20, 44, 44, 8, lit ? '#FFD98A' : '#3A3F6E') + R(40, -20, 44, 44, 8, '#3A3F6E') + (lit ? G(R(-84, -20, 44, 44, 8, '#FFE6A0'), 'class="anim-glow"') : ''), at(x, y, s));
  }

  /* ---------- scenes ---------- */
  const layer = (z, svg, cls = '') => ({ z, svg, cls });
  const SCENES = {
    cover() {
      const id = uid('sky');
      return { layers: [
        layer(-320, `<defs>${linear(id, [[0, '#F9C5A0'], [0.55, '#FBE3C0'], [1, '#CFE6F5']])}</defs>` + R(-400, -400, 1800, 1800, 0, `url(#${id})`) + sun(500, 520, 150, '#FFD98A') + starsField(5, 8, 100, 40, 800, 260, 6, '#FFFFFF')),
        layer(-240, cloud(160, 300, 1.4, '#FFF7F0') + cloud(840, 260, 1.1, '#FFF7F0') + cloud(520, 180, 0.8, '#FFF7F0')),
        layer(-170, P('M -400,760 Q 200,600 520,720 Q 800,820 1400,680 L 1400,1400 L -400,1400 Z', '#B9D9A4') + house(800, 690, 0.7)),
        layer(-120, cloud(60, 520, 1.2, '#FFFFFF', 'anim-drift') + cloud(940, 470, 1.0, '#FFFFFF', 'anim-drift2')),
        layer(-30, A('anim-breathe', dadStand({ arms: 'lift', eyes: 'happy', mouth: 'bigsmile' }) + G(G(babySit({ arms: 'wide', eyes: 'happy', mouth: 'grin' }), 'class="anim-bob"'), 'transform="translate(0 -236) scale(.85)"'), 500, 560)),
        layer(90, hearts(680, 300, 1.1) + hearts(300, 340, 0.8)),
        layer(170, P('M -400,900 Q 100,820 400,900 Q 700,980 1400,880 L 1400,1400 L -400,1400 Z', '#9CCB8C')),
      ], cues: {} };
    },
    crib() {
      return { layers: [
        layer(-320, wall({ color: '#FFE3C8', dots: '#FFCFA8', floorY: 700, floor: '#E8C9A4', planks: '#D9B58C', trim: '#FFF6EA' })),
        layer(-300, windowDay(560, 150, 300, 260, { frame: '#FFF9F0' }) + R(110, 330, 150, 380, 6, '#3C3556')),
        layer(-290, G(G(dadPeek({ eyes: 'happy', mouth: 'bigsmile', look: { x: 0.03, y: 0 } }), 'class="peeker"'), 'transform="translate(305 470) scale(.62)"')),
        layer(-280, door(110, 330, 150, 380, { open: true, trim: '#FFF9F0', leaf: '#F7E8D6', hall: 'none' })),
        layer(-240, curtains(560, 150, 300, 260, '#F9B6A0')),
        layer(-200, rug(500, 840, 380, 76, '#F6C9CF', '#F19BA8')),
        layer(-150, cribRail(260, 470, 480, 170, '#D0A06E', false)),
        layer(-120, mattress(250, 600, 500, 70)),
        layer(-70, A('anim-breathe', babyLying({ eyes: 'open', mouth: 'small', look: { x: 0.06, y: -0.04 } }), 400, 580, 0.92)),
        layer(-40, mobile(500, 260)),
        layer(30, cribRail(240, 500, 520, 190, '#C5915F', true)),
        layer(110, G(notes(700, 470, 0.6, '#F19A55'), 'class="coo"')),
        layer(160, bunny(150, 820, 1.2)),
      ], cues: { coo: 'coo', hide: 'hide' } };
    },
    hello() {
      return { layers: [
        layer(-320, wall({ color: '#FFE3C8', dots: '#FFCFA8', floorY: 700, floor: '#E8C9A4', planks: '#D9B58C', trim: '#FFF6EA' })),
        layer(-280, windowDay(620, 150, 260, 230, { frame: '#FFF9F0' }) + door(130, 250, 210, 470, { trim: '#FFF9F0', hall: '#4A4062' })),
        layer(-230, A('anim-breathe', dadStand({ arms: 'wave', eyes: 'happy', mouth: 'bigsmile' }), 240, 370, 0.9)),
        layer(-200, rug(560, 840, 360, 74, '#F6C9CF', '#F19BA8')),
        layer(-150, cribRail(360, 470, 440, 170, '#D0A06E', false)),
        layer(-120, mattress(350, 600, 460, 70)),
        layer(-70, A('anim-bob', babySit({ arms: 'up', eyes: 'open', mouth: 'bigsmile', look: { x: -0.06, y: -0.02 }, alt: { mouth: 'tongue', eyes: 'happy' } }), 590, 500, 0.95)),
        layer(30, cribRail(340, 500, 480, 190, '#C5915F', true)),
        layer(100, G(hearts(360, 330, 0.7, '#F7A1B1'), 'class="whisper"')),
        layer(160, plant(880, 820, 1.4)),
      ], cues: { whispering: 'whisper', tongue: 'alt', smile: 'smile' } };
    },
    chair() {
      const hc = highchair(500, 460);
      return { layers: [
        layer(-320, wall({ color: '#DDF2E6', stripes: '#CDEBD8', floorY: 720, floor: '#F0E2CE', trim: '#FFFFFF' })),
        layer(-280, windowDay(150, 140, 260, 230, { frame: '#FFFFFF', top: '#A9DDF3' }) + shelf(600, 300, 300, '#C9986A')),
        layer(-200, R(-400, 720, 1800, 60, 0, '#E3D2B8')),
        layer(-120, hc.back),
        layer(-70, A('anim-bob', babyChair({ eyes: 'open', mouth: 'o', look: { x: 0.05, y: 0.02 }, alt: { mouth: 'grin', eyes: 'happy' } }), 500, 380, 1)),
        layer(-30, hc.tray),
        layer(0, bowlSet(620, 520)),
        layer(30, spoon(620, 520)),
        layer(110, G(G(P(star5(22), '#FFD24A') + G(P(star5(14), '#FFD24A'), 'transform="translate(70 -50)"') + G(P(star5(12), '#FFD24A'), 'transform="translate(-60 -70)"'), 'class="sparkle"'), 'transform="translate(330 300)"')),
        layer(160, G(R(-80, 26, 160, 16, 8, '#C9986A') + R(-64, 40, 16, 120, 6, '#C9986A') + R(48, 40, 16, 120, 6, '#C9986A') + E(0, 0, 90, 26, '#E9DED0') + E(-28, -18, 30, 20, '#FFD24A', 'transform="rotate(-20 -28 -18)"') + C(20, -18, 22, '#F25F5C') + C(48, -10, 18, '#7CC47F'), at(150, 760))),
      ], cues: { catches: 'splat', bite: 'bite', good: 'sparkle' } };
    },
    tummy() {
      return { layers: [
        layer(-320, wall({ color: '#E4EEF9', dots: '#D2E1F3', floorY: 690, floor: '#E9D6BC', planks: '#DCC4A4', trim: '#FFFFFF' })),
        layer(-280, windowDay(640, 140, 260, 220, { frame: '#FFFFFF' }) + frames(220, 260)),
        layer(-220, sofa(120, 430, 360)),
        layer(-170, playmat(520, 760)),
        layer(-120, blocks(800, 640)),
        layer(-90, A('anim-breathe', dadTummy({ look: { x: -0.05, y: 0.05 } }), 640, 580, 0.9)),
        layer(-30, A('crawler', babyTummy({ eyes: 'open', mouth: 'bigsmile', look: { x: 0.05, y: -0.04 } }), 370, 660, 1)),
        layer(70, bunny(150, 760, 1.1)),
        layer(160, plant(880, 880, 1.6)),
      ], cues: { crawl: 'crawl', play: 'play' } };
    },
    dance() {
      const id = uid('ray');
      let rays = ''; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; rays += `M 0,0 L ${n(Math.cos(a) * 1400)},${n(Math.sin(a) * 1400)} L ${n(Math.cos(a + 0.12) * 1400)},${n(Math.sin(a + 0.12) * 1400)} Z `; }
      return { layers: [
        layer(-320, wall({ color: '#FFF0BF', floorY: 700, floor: '#F2D9B4', planks: '#E6C79A', trim: '#FFFFFF' }) + G(G(P(rays, '#FFE38A', 'opacity=".5"'), 'class="anim-spin-slow"'), 'transform="translate(760 180)"')),
        layer(-280, windowDay(600, 120, 300, 260, { frame: '#FFFFFF', top: '#8FD3F4' })),
        layer(-200, rug(500, 840, 400, 80, '#BFE8DA', '#8FD1BF')),
        layer(-110, A('anim-dance', dadDance(), 650, 480, 0.92)),
        layer(-30, A('anim-bob', babySit({ arms: 'reach', eyes: 'happy', mouth: 'grin' }), 360, 640, 1)),
        layer(50, ball(620, 790, 48)),
        layer(100, G(notes(300, 400, 0.9, '#4F9DDE'), 'class="sing"') + G(notes(800, 380, 0.7, '#F25F5C'), 'class="sing"')),
        layer(160, G(starsField(8, 12, 0, 0, 1000, 1000, 9, '#FFD24A'), 'class="confetti"')),
      ], cues: { sing: 'sing', dance: 'dance', ball: 'ball' } };
    },
    story() {
      const rc = rockingChair(500, 560);
      return { layers: [
        layer(-320, wall({ color: '#2D2F5E', dots: '#35386B', floorY: 720, floor: '#3A2E3F', planks: '#463848', trim: '#4A4C7C' })),
        layer(-280, windowNight(600, 130, 280, 240, { frame: '#5E5F8C' }) + bookshelf(120, 220, 230, 380, '#4E3A3A')),
        layer(-200, lamp(250, 420, { glow: 360 })),
        layer(-150, nightstand(800, 640) + noiseMachine(800, 640)),
        layer(-100, rc.back),
        layer(-40, A('anim-rock', dadSit() + G(babyHeld({ eyes: 'sleepy', mouth: 'small' }), 'transform="translate(-34 140) scale(.72)"') + G(R(-40, -30, 80, 60, 6, '#E85D75') + R(-34, -24, 68, 48, 4, '#FFF8EC') + L(-24, -14, 24, -14, '#C9C0D8', 4) + L(-24, -2, 24, -2, '#C9C0D8', 4) + L(-24, 10, 10, 10, '#C9C0D8', 4), 'transform="translate(54 176) rotate(-12)"') + C(70, 200, 18, '--skin'), 500, 400, 1)),
        layer(20, rc.front),
        layer(100, G(starsField(4, 6, 300, 200, 400, 300, 10, '#FFF1C2'), 'class="sleepy"')),
      ], cues: { darkened: 'dark', noise: 'noise', womb: 'womb' }, dim: { x: 25, y: 46 } };
    },
    snuggle() {
      return { layers: [
        layer(-320, wall({ color: '#3B3566', dots: '#433D72', floorY: 700, floor: '#4A3B4E', planks: '#553F55', trim: '#5A5488' })),
        layer(-280, windowNight(560, 140, 300, 250, { frame: '#5E5F8C', seed: 9 }) + thermostat(200, 300)),
        layer(-240, breeze(560, 290)),
        layer(-220, cribRail(700, 520, 300, 140, '#7A6248', false) + mattress(695, 610, 310, 50, '#D9CDE0', '#B7A9CC') + cribRail(690, 540, 320, 150, '#6B5540', true)),
        layer(-200, C(150, 600, 26, '#FFE6A0', 'class="anim-glow"') + R(130, 610, 40, 36, 8, '#8C8AAA')),
        layer(-40, A('anim-rock-soft', dadHoldShoulder({ babyAlt: { eyes: 'sleep', mouth: 'small' } }), 430, 470, 0.95)),
        layer(90, G(zzz(560, 300, 0.7), 'class="zz"')),
      ], cues: { rub: 'rub', colder: 'cold', sack: 'alt' }, dim: { x: 15, y: 66 } };
    },
    milk() {
      const ac = armchair(500, 560);
      return { layers: [
        layer(-320, wall({ color: '#1F2350', dots: '#262A5C', floorY: 720, floor: '#2B2540', planks: '#352E4C', trim: '#3F3F72' }) + starsField(12, 14, 0, 0, 1000, 400, 5, '#7E86C9')),
        layer(-280, windowNight(120, 140, 280, 240, { frame: '#5E5F8C', seed: 21 })),
        layer(-200, lamp(800, 360, { glow: 320 })),
        layer(-160, ac.back),
        layer(-40, A('anim-rock-soft', dadCradle(), 500, 400, 1)),
        layer(0, ac.front),
        layer(90, dreamBubble(720, 200)),
        layer(120, G(zzz(300, 330, 0.8), 'class="zz"')),
      ], cues: { milk: 'milk', Poof: 'poof', asleep: 'zz', Dreaming: 'dream' }, dim: { x: 80, y: 40 } };
    },
    kiss() {
      return { layers: [
        layer(-320, wall({ color: '#1B1E48', dots: '#232759', floorY: 720, floor: '#2A2440', planks: '#33304F', trim: '#3B3D6E' })),
        layer(-280, windowNight(520, 120, 340, 280, { frame: '#5E5F8C', seed: 33 })),
        layer(-150, cribRail(230, 500, 480, 170, '#7A6248', false)),
        layer(-120, mattress(220, 630, 500, 70, '#D9CDE0', '#B7A9CC')),
        layer(-90, G(G(dadStand({ arms: 'kiss', eyes: 'sleep', mouth: 'kiss' }), 'class="anim-rock-soft"'), 'transform="translate(560 470) rotate(-34)"')),
        layer(-70, A('anim-breathe', babyAsleep(), 380, 610, 0.9)),
        layer(-40, mobile(470, 300)),
        layer(30, cribRail(210, 530, 520, 190, '#6B5540', true)),
        layer(100, G(hearts(560, 380, 1, '#F7A1B1'), 'class="whisper"')),
        layer(130, G(G(text(0, 0, 44, 'shhh', '#9FA3D6') + L(-58, 8, 58, -12, '#F26D85', 8), 'class="shh"'), 'transform="translate(760 300) rotate(-10)"')),
      ], cues: { day: 'whisper', 'shhh’s': 'shh', needed: 'twinkle' }, dim: { x: 62, y: 30 } };
    },
    end() {
      const id = uid('nsky');
      return { layers: [
        layer(-320, `<defs>${linear(id, [[0, '#0F1235'], [1, '#2E3A78']])}</defs>` + R(-400, -400, 1800, 1800, 0, `url(#${id})`) + starsField(2, 40, 0, 0, 1000, 620, 7)),
        layer(-260, moon(720, 240, 70, '#1A1F52')),
        layer(-180, P('M -400,760 Q 200,620 520,720 Q 800,820 1400,680 L 1400,1400 L -400,1400 Z', '#2F4F5F') + house(500, 690, 0.9)),
        layer(-100, P('M -400,900 Q 100,800 400,900 Q 700,980 1400,860 L 1400,1400 L -400,1400 Z', '#223B4A')),
        layer(60, G(zzz(560, 560, 1), 'class="zz on"')),
        layer(150, G([80, 200, 330, 760, 900].map(x => L(x, 1000, x + 10, 900, '#1A2E3A', 6) + C(x + 12, 894, 12, '#3E5D6E')).join(''))),
      ], cues: {} };
    },
  };
  return { SCENES };
})();
