#!/usr/bin/env python3
"""Build the orchestral instrument sprites for the game from the FluidR3_GM soundfont renders in gleitz/midi-js-soundfonts
(FluidR3_GM by Frank Wen, rendered by Benjamin Gleitzman; CC BY 3.0 as published there; FluidR3 itself is MIT).

Usage: python3 tools/audio/build_instruments.py <dir with *-ogg.js files> <out dir (audio/)>
Each instrument becomes one sprite: every kept note sits in a fixed slot (mono, 32 kHz). Sustained instruments get a baked crossfade
loop so long notes can hold. Writes <name>.ogg, <name>.mp3 and inst.json (notes, slot length, loop points).
Every third semitone is kept inside the range the score uses; the game's sampler pitches between them.
"""
import sys, os, re, json, base64, subprocess, tempfile
import numpy as np

SR = 32000
# name: (lo, hi, step, slot seconds, loop [start,end] or None, gain)
INST = {
 'strings':   ('string_ensemble_1', 40, 88, 3, 2.4, (1.0, 2.3), 1.0),
 'tremolo':   ('tremolo_strings',  43, 79, 3, 2.0, (0.8, 1.9), 0.9),
 'pizz':      ('pizzicato_strings',36, 84, 3, 1.0, None, 1.0),
 'cello':     ('cello',            36, 67, 3, 2.2, (1.0, 2.1), 1.0),
 'bass':      ('contrabass',       28, 55, 3, 2.0, (0.9, 1.9), 1.0),
 'harp':      ('orchestral_harp',  36, 96, 3, 2.0, None, 1.0),
 'flute':     ('flute',            60, 96, 3, 2.0, (0.8, 1.9), 0.9),
 'oboe':      ('oboe',             58, 88, 3, 2.0, (0.8, 1.9), 0.9),
 'clarinet':  ('clarinet',         50, 86, 3, 2.0, (0.8, 1.9), 0.9),
 'horn':      ('french_horn',      41, 77, 3, 2.2, (1.0, 2.1), 1.0),
 'trumpet':   ('trumpet',          55, 82, 3, 1.8, (0.8, 1.7), 0.9),
 'trombone':  ('trombone',         40, 70, 3, 1.8, (0.8, 1.7), 1.0),
 'brass':     ('brass_section',    41, 79, 3, 2.0, (0.9, 1.9), 0.9),
 'choir':     ('choir_aahs',       48, 79, 3, 2.4, (1.0, 2.3), 1.0),
 'organ':     ('church_organ',     36, 84, 3, 2.2, (0.8, 2.1), 0.8),
 'celesta':   ('celesta',          60, 96, 3, 1.6, None, 1.0),
 'glock':     ('glockenspiel',     72, 99, 3, 1.4, None, 0.9),
 'lute':      ('acoustic_guitar_nylon', 40, 76, 3, 1.6, None, 1.0),
 'fiddle':    ('fiddle',           55, 88, 3, 1.8, (0.8, 1.7), 0.9),
 'accordion': ('accordion',        48, 79, 3, 1.8, (0.8, 1.7), 0.8),
 'timpani':   ('timpani',          38, 56, 3, 2.0, None, 1.0),
 'taiko':     ('taiko_drum',       40, 52, 6, 1.6, None, 1.0),
 'tom':       ('melodic_tom',      43, 55, 6, 1.0, None, 1.0),
}
NAMES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
def nn(m): return NAMES[m % 12] + str(m // 12 - 1)

def load_js(path):
    s = open(path).read()
    return dict(re.findall(r'"([A-G]b?\d)": "data:audio/ogg;base64,([^"]+)"', s))

def decode(b64):
    with tempfile.NamedTemporaryFile(suffix='.ogg', delete=False) as f:
        f.write(base64.b64decode(b64)); p = f.name
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    os.unlink(p)
    return np.frombuffer(raw, dtype=np.float32).copy()

def prep(x, slot, loop):
    n = int(slot * SR)
    # drop leading silence so every note starts on its slot
    th = np.max(np.abs(x)) * 0.02 if len(x) else 0
    i0 = int(np.argmax(np.abs(x) > th)) if len(x) else 0
    x = x[max(0, i0 - 16):]
    if len(x) < n: x = np.concatenate([x, np.zeros(n - len(x), np.float32)])
    x = x[:n].copy()
    if loop:
        a, b = int(loop[0] * SR), int(loop[1] * SR); cf = int(0.25 * SR)
        # bake a crossfade so the end of the loop melts into its start
        t = np.linspace(0, 1, cf, dtype=np.float32)
        x[b - cf:b] = x[b - cf:b] * (1 - t) + x[a - cf:a] * t
        x[b:] = 0
    else:
        f = int(0.12 * SR); x[-f:] *= np.linspace(1, 0, f, dtype=np.float32)
    return x

def main(src, out):
    os.makedirs(out, exist_ok=True); man = {}
    for name, (gm, lo, hi, step, slot, loop, gain) in INST.items():
        notes = load_js(os.path.join(src, gm + '-ogg.js'))
        keep = [m for m in range(lo, hi + 1, step) if nn(m) in notes]
        bufs = []
        for m in keep: bufs.append(prep(decode(notes[nn(m)]), slot, loop))
        y = np.concatenate(bufs)
        pk = np.max(np.abs(y)) or 1; y = y / pk * 0.89 * gain
        wav = os.path.join(out, name + '.wav')
        import wave
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-v', 'quiet', '-y', '-i', wav, '-c:a', 'libvorbis', '-q:a', '0', os.path.join(out, name + '.ogg')], check=True)
        subprocess.run(['ffmpeg', '-v', 'quiet', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '40k', os.path.join(out, name + '.mp3')], check=True)
        os.unlink(wav)
        man[name] = {'notes': keep, 'slot': slot, 'loop': list(loop) if loop else None}
        print(name, len(keep), 'notes', os.path.getsize(os.path.join(out, name + '.ogg')) // 1024, 'KB ogg', os.path.getsize(os.path.join(out, name + '.mp3')) // 1024, 'KB mp3')
    json.dump(man, open(os.path.join(out, 'inst.json'), 'w'), separators=(',', ':'))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
