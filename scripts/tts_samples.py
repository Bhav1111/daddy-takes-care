#!/usr/bin/env python3
"""Render one sample passage in several Kokoro voices so the author can pick. Usage: tts_samples.py af_heart af_bella am_michael ..."""
import os, sys, wave, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts_kokoro import SR, synth, speak_text
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'build', 'samples'); os.makedirs(OUT, exist_ok=True)
TEXT = ["You come in my room, whispering softly of well-wishes, so dear and true,",
        "You smile, and I stick my tongue out, while smiling big, right back at you.",
        "Poof, I’m asleep, and my tummy is full.", "Dreaming of your kisses and well-wishes."]
SPEED = float(os.environ.get('SPEED', '0.9'))
for voice in sys.argv[1:]:
    parts = []
    for line in TEXT:
        a, _ = synth(speak_text(line), voice, SPEED); parts += [a, np.zeros(int(0.5 * SR), np.float32)]
    a = np.concatenate(parts); a = a * min(1.0, 0.89 / (float(np.abs(a).max()) or 1.0))
    wav = os.path.join(OUT, f'{voice}.wav'); mp3 = os.path.join(OUT, f'voice-{voice}.mp3')
    with wave.open(wav, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', mp3], check=True)
    print(voice, f'{len(a)/SR:.1f}s ->', mp3)
