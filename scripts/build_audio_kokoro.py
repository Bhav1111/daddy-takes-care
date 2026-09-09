#!/usr/bin/env python3
"""Narration with Kokoro-82M (local neural TTS). Emits build/narration.json in the same shape as build_audio.py."""
import os, sys, json, wave, base64, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts_kokoro import SR, FPS, synth, speak_text, envelope, speech_span, word_times
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); BUILD = os.path.join(ROOT, 'build')
VOICE = os.environ.get('VOICE', 'af_heart'); SPEED = float(os.environ.get('SPEED', '0.9')); BITRATE = os.environ.get('BITRATE', '64k')
LEAD, TAIL = 0.35, 0.7

def main():
    story = json.load(open(os.path.join(ROOT, 'src', 'story.json')))
    out_pages = []; total = 0.0
    for page in story['pages']:
        mix = [np.zeros(int(LEAD * SR), np.float32)]; pos = LEAD; lines_out = []
        for li, line in enumerate(page['lines']):
            toks = line.split(); audio, mt = synth(speak_text(line), VOICE, SPEED)
            env = envelope(audio); S, E = speech_span(env); Ss, Es = S / FPS, E / FPS
            words = word_times(toks, mt, Ss, Es)
            pre, post = 0.08, 0.14
            seg_s = max(0.0, Ss - pre); seg_e = min(len(audio) / SR, Es + post)
            seg = audio[int(seg_s * SR):int(seg_e * SR)].copy(); ramp = int(0.005 * SR)
            if len(seg) > 2 * ramp: seg[:ramp] *= np.linspace(0, 1, ramp); seg[-ramp:] *= np.linspace(1, 0, ramp)
            T0 = pos; mix.append(seg); pos += len(seg) / SR
            lw = [{'w': w, 's': round(T0 + s - seg_s, 3), 'e': round(T0 + e - seg_s, 3)} for (w, s, e) in words]
            lines_out.append({'text': line, 'words': lw})
            stamped = sum(1 for (_, _, s, e) in mt if s is not None)
            print(f"  {page['id']:8s} line {li}: {len(toks):2d} words, {stamped:2d} stamped tokens, {Es - Ss:.2f}s")
            if li < len(page['lines']) - 1:
                gap = 0.62 if line.rstrip()[-1] in '.?!' else 0.45
                mix.append(np.zeros(int(gap * SR), np.float32)); pos += gap
        mix.append(np.zeros(int(TAIL * SR), np.float32)); pos += TAIL
        a = np.concatenate(mix); peak = float(np.abs(a).max()) or 1.0; a = a * min(1.0, 0.89 / peak)
        wav = os.path.join(BUILD, f"page-{page['id']}.wav"); mp3 = wav[:-4] + '.mp3'
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', BITRATE, '-ar', str(SR), '-ac', '1', mp3], check=True)
        dur = len(a) / SR; total += dur
        out_pages.append({**page, 'duration': round(dur, 3), 'lines': lines_out, 'audio': 'data:audio/mpeg;base64,' + base64.b64encode(open(mp3, 'rb').read()).decode()})
    data = {'voice': f'kokoro/{VOICE}', 'speed': SPEED, 'title': story['title'], 'subtitle': story['subtitle'], 'tagline': story['tagline'], 'pages': out_pages}
    with open(os.path.join(BUILD, 'narration.json'), 'w') as f: json.dump(data, f)
    print(f"total narration {total:.1f}s, narration.json {os.path.getsize(os.path.join(BUILD, 'narration.json'))/1024:.0f} KB, voice {VOICE} speed {SPEED}")

if __name__ == '__main__': main()
