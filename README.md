# Daddy Takes Care

*No Shhh’s Needed.* An interactive picture book told from the baby’s side of the crib.
Words by Baruch Havia.

**Read it:** https://bhav1111.github.io/daddy-takes-care/

The book reads itself aloud, lights up every word as it is spoken, layers each scene in 3D, and lets Dad record his own narration (recordings stay on the device).

## Layout

- `src/story.json` — the text, one entry per page
- `src/art.js` — the illustration kit (original SVG art, scenes, cues)
- `src/style.css`, `src/app.js`, `src/index.html` — the book itself
- `scripts/build_audio_kokoro.py` — narration with Kokoro-82M (local neural TTS); word timings come from the model
- `scripts/build_audio.py` — earlier narration path using macOS `say`
- `scripts/build_cover.mjs` — share card and app icon
- `scripts/build.py` — inlines everything into `dist/` (single file) and `docs/` (the hosted site)
- `docs/` — what GitHub Pages serves

## Rebuild

```bash
uv venv .venv-tts --python 3.12 && uv pip install --python .venv-tts/bin/python "kokoro>=0.9.4" soundfile phonemizer-fork numpy
export VIRTUAL_ENV="$PWD/.venv-tts"
VOICE=af_heart SPEED=0.9 .venv-tts/bin/python scripts/build_audio_kokoro.py   # other voices: af_bella, am_michael, bm_george …
node scripts/build_cover.mjs && python3 scripts/build.py
```

`ffmpeg` and (on macOS) Homebrew’s `espeak-ng` are expected on the PATH.
