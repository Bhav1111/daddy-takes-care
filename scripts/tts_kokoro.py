#!/usr/bin/env python3
"""Shared Kokoro helpers: synthesize a line, return 24 kHz audio plus per-word [start, end] from the model's token timestamps."""
import os, re, numpy as np
SR = 24000; FPS = 100; FRAME = SR // FPS
_pipe = None
def pipeline():
    global _pipe
    if _pipe is None:
        from kokoro import KPipeline
        _pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
    return _pipe

SPEAK = [("Shhh’s", "Shushes"), ("shhh’s", "shushes"), ("’", "'")]
def speak_text(s):
    for a, b in SPEAK: s = s.replace(a, b)
    return s

def envelope(a):
    n = (len(a) // FRAME) * FRAME
    if n == 0: return np.array([-100.0])
    fr = a[:n].reshape(-1, FRAME); e = (fr * fr).mean(axis=1)
    return 10 * np.log10(e + 1e-10)
def speech_span(env, rel=34):
    thr = env.max() - rel; idx = np.where(env > thr)[0]
    return (int(idx[0]), int(idx[-1]) + 1) if len(idx) else (0, len(env))

def _flat(tokens):
    out = []
    for t in tokens or []:
        if isinstance(t, (list, tuple)): out.extend(_flat(t))
        else: out.append(t)
    return out

def synth(text, voice, speed):
    """Returns (audio float32 @24k, tokens[(text, whitespace, start, end)]) for one utterance."""
    audio, toks, offset = [], [], 0.0
    for r in pipeline()(text, voice=voice, speed=speed):
        a = r.audio.detach().cpu().numpy().astype(np.float32) if hasattr(r.audio, 'detach') else np.asarray(r.audio, dtype=np.float32)
        for t in _flat(r.tokens):
            s, e = getattr(t, 'start_ts', None), getattr(t, 'end_ts', None)
            toks.append((t.text, getattr(t, 'whitespace', ' ') or '', None if s is None else float(s) + offset, None if e is None else float(e) + offset))
        audio.append(a); offset += len(a) / SR
    return (np.concatenate(audio) if audio else np.zeros(0, np.float32)), toks

def word_times(display_tokens, toks, S, E):
    """Map model tokens onto the display words of a line. Returns [(word, start, end)] in seconds (line-relative)."""
    groups, cur = [], []
    for (text, ws, s, e) in toks:
        cur.append((text, s, e))
        if ws.strip() == '' and ws != '': groups.append(cur); cur = []
    if cur: groups.append(cur)
    stamped = []
    for g in groups:
        ts = [(s, e) for (t, s, e) in g if s is not None and e is not None and re.search(r'\w', t)]
        stamped.append((min(x[0] for x in ts), max(x[1] for x in ts)) if ts else (None, None))
    n = len(display_tokens)
    if len(stamped) != n:                                   # tokenizer disagreed with whitespace split: spread by characters
        known = [x for x in stamped if x[0] is not None]
        s0, e1 = (known[0][0], known[-1][1]) if known else (S, E)
        w = [len(re.sub(r'[^\w]', '', t)) + 1 for t in display_tokens]; tot = sum(w); cum = 0; stamped = []
        for k in w: stamped.append((s0 + (e1 - s0) * cum / tot, s0 + (e1 - s0) * (cum + k) / tot)); cum += k
    out = []
    for i, (s, e) in enumerate(stamped):                    # fill gaps from neighbours
        if s is None:
            prev = out[-1][2] if out else S
            nxt = next((x[0] for x in stamped[i + 1:] if x[0] is not None), E)
            s, e = prev, max(prev + 0.08, nxt)
        if out and s < out[-1][2]: s = out[-1][2]
        if e <= s: e = s + 0.08
        out.append((display_tokens[i], round(s, 3), round(e, 3)))
    return out
