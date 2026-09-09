#!/usr/bin/env python3
"""Pre-render narration with macOS `say`, derive per-word timings, encode MP3, emit build/narration.json.

Timing method: every line is synthesized whole (natural prosody). Word boundaries come from
cumulative prefix synthesis ("I", "I sit", "I sit in", ...) measured in context, then re-scaled onto
phrase spans detected from silence gaps in the full-line audio (gaps are matched to punctuation).
"""
import os, re, sys, json, wave, array, math, base64, hashlib, subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build'); CACHE = os.path.join(BUILD, 'cache')
os.makedirs(CACHE, exist_ok=True)
VOICE = os.environ.get('VOICE', 'Samantha'); RATE = os.environ.get('RATE', '150')
BITRATE = os.environ.get('BITRATE', '48k')
SR = 22050; FPS = 100; FRAME = SR // FPS          # 10 ms analysis frames
LEAD, TAIL = 0.35, 0.7

SPEAK = [("Shhh’s", "Shushes"), ("shhh’s", "shushes"), ("’", "'")]
def speak_text(s):
    for a, b in SPEAK: s = s.replace(a, b)
    return s

def synth(text):
    key = hashlib.sha1(f"{VOICE}|{RATE}|{text}".encode()).hexdigest()
    path = os.path.join(CACHE, key + '.wav')
    if not os.path.exists(path):
        subprocess.run(['say', '-v', VOICE, '-r', RATE, '-o', path, '--file-format=WAVE',
                        '--data-format=LEI16@22050', text], check=True)
    return path

def read_wav(path):
    with wave.open(path, 'rb') as w:
        assert w.getframerate() == SR and w.getnchannels() == 1, path
        a = array.array('h'); a.frombytes(w.readframes(w.getnframes()))
    return a

def envelope(a):
    env = []
    for i in range(0, len(a) - FRAME + 1, FRAME):
        f = a[i:i + FRAME]; e = sum(x * x for x in f) / FRAME
        env.append(10 * math.log10(e + 1e-9))
    return env

def speech_span(env, rel=32):
    thr = max(env) - rel
    idx = [i for i, v in enumerate(env) if v > thr]
    return (idx[0], idx[-1] + 1, thr) if idx else (0, len(env), thr)

def gaps(env, S, E, thr, min_frames=8):
    out = []; run = None
    for i in range(S, E):
        if env[i] <= thr:
            run = i if run is None else run
        else:
            if run is not None and i - run >= min_frames: out.append((run, i))
            run = None
    return out

def trimmed_seconds(path):
    env = envelope(read_wav(path)); S, E, _ = speech_span(env)
    return (E - S) / FPS

def align_line(toks, D, S, E, G):
    """toks: tokens; D[k]: trimmed duration of first-k-tokens prefix; S,E: speech span (s); G: gaps [(s,e)]."""
    n = len(toks)
    breaks = [i for i in range(n - 1) if re.search(r"[,;:.?!—]$", toks[i])]
    m = len(breaks); bounds = None
    if m and len(G) >= m:
        chosen = sorted(sorted(G, key=lambda g: g[1] - g[0], reverse=True)[:m])
        ok = True
        for p, b in enumerate(breaks):                       # sanity: gap must sit near predicted break
            predicted = S + (E - S) * D[b + 1] / D[n]
            if abs(chosen[p][0] - predicted) > 0.4: ok = False
        if ok:
            starts = [0] + [b + 1 for b in breaks]; ends = breaks + [n - 1]; bounds = []
            for p, (a, b) in enumerate(zip(starts, ends)):
                ps = S if p == 0 else chosen[p - 1][1]
                pe = E if p == m else chosen[p][0]
                pause = 0 if p == 0 else chosen[p - 1][1] - chosen[p - 1][0]
                bounds.append((a, b, ps, pe, pause))
    if bounds is None: bounds = [(0, n - 1, S, E, 0)]
    words = []
    for (a, b, ps, pe, pause) in bounds:
        deltas = []
        for k in range(a, b + 1):
            d = D[k + 1] - D[k]
            if k == a and a > 0: d -= pause
            deltas.append(max(0.07, d))
        tot = sum(deltas); span = pe - ps; cum = 0.0
        for j, k in enumerate(range(a, b + 1)):
            s = ps + span * cum / tot; cum += deltas[j]; e = ps + span * cum / tot
            words.append((toks[k], round(s, 3), round(e, 3)))
    return words, len(bounds)

def main():
    story = json.load(open(os.path.join(ROOT, 'src', 'story.json')))
    # 1) synthesize everything in parallel (lines + all prefixes)
    jobs = set()
    for page in story['pages']:
        for line in page['lines']:
            toks = line.split()
            for k in range(1, len(toks) + 1): jobs.add(speak_text(' '.join(toks[:k])))
    with ThreadPoolExecutor(8) as ex: list(ex.map(synth, sorted(jobs)))
    print(f"synthesized {len(jobs)} clips with {VOICE} @ {RATE} wpm")

    out_pages = []; total = 0.0
    for page in story['pages']:
        mix = array.array('h', [0] * int(LEAD * SR)); words_out = []; lines_out = []
        for li, line in enumerate(page['lines']):
            toks = line.split()
            full = read_wav(synth(speak_text(line))); env = envelope(full)
            S, E, thr = speech_span(env); G = gaps(env, S, E, thr)
            D = [0.0] + [trimmed_seconds(synth(speak_text(' '.join(toks[:k])))) for k in range(1, len(toks) + 1)]
            words, nph = align_line(toks, D, S / FPS, E / FPS, [(g0 / FPS, g1 / FPS) for g0, g1 in G])
            pre, post = 0.06, 0.12
            seg_s = max(0.0, S / FPS - pre); seg_e = min(len(full) / SR, E / FPS + post)
            seg = full[int(seg_s * SR):int(seg_e * SR)]
            ramp = int(0.004 * SR)
            for i in range(ramp):                              # de-click edges
                seg[i] = int(seg[i] * i / ramp); seg[-1 - i] = int(seg[-1 - i] * i / ramp)
            T0 = len(mix) / SR; mix.extend(seg)
            lw = []
            for (w, s, e) in words:
                lw.append({'w': w, 's': round(T0 + s - seg_s, 3), 'e': round(T0 + e - seg_s, 3)})
            words_out.extend(lw); lines_out.append({'text': line, 'words': lw})
            print(f"  {page['id']:8s} line {li}: {len(toks):2d} words, {nph} phrase(s), {len(G)} gap(s), {E/FPS - S/FPS:.2f}s")
            if li < len(page['lines']) - 1:
                mix.extend([0] * int((0.62 if line.rstrip()[-1] in '.?!' else 0.45) * SR))
        mix.extend([0] * int(TAIL * SR))
        wav = os.path.join(BUILD, f"page-{page['id']}.wav"); mp3 = wav[:-4] + '.mp3'
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(mix.tobytes())
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame',
                        '-b:a', BITRATE, '-ar', str(SR), '-ac', '1', mp3], check=True)
        dur = len(mix) / SR; total += dur
        b64 = base64.b64encode(open(mp3, 'rb').read()).decode()
        out_pages.append({**page, 'duration': round(dur, 3), 'lines': lines_out,
                          'audio': 'data:audio/mpeg;base64,' + b64})
    # round-trip check of encoder delay on the first story page
    chk = os.path.join(BUILD, 'roundtrip.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(BUILD, 'page-crib.mp3'),
                    '-ar', str(SR), '-ac', '1', chk], check=True)
    o = speech_span(envelope(read_wav(os.path.join(BUILD, 'page-crib.wav'))))[0]
    r = speech_span(envelope(read_wav(chk)))[0]
    print(f"encoder round-trip onset shift: {(r - o) * 10} ms")
    data = {'voice': VOICE, 'rate': int(RATE), 'title': story['title'], 'subtitle': story['subtitle'],
            'tagline': story['tagline'], 'pages': out_pages}
    with open(os.path.join(BUILD, 'narration.json'), 'w') as f: json.dump(data, f)
    size = os.path.getsize(os.path.join(BUILD, 'narration.json'))
    print(f"total narration {total:.1f}s, narration.json {size/1024:.0f} KB")

if __name__ == '__main__': main()
