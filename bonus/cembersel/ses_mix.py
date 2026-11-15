"""Efekt sesleri (TYT formatındaki kayıtlar). Seslendirme YOK, fon müziği yok.
- kalem.wav: kalemle yazarken, ÇOK KISIK (seslendirmeyi rahatsız etmesin)
- gecis.wav: sahne geçişi
- tik.wav : Takip Et kartı, tıklama, ✓/✗
Kullanım: python3 -I ses_mix.py olaylar.json efekt.wav
"""
import json, sys, wave, os
import numpy as np

SR = 44100
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sesler')
def load(n):
    w = wave.open(os.path.join(D, n)); return np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0
KALEM, GECIS, TIK = load('kalem.wav'), load('gecis.wav'), load('tik.wav')
E = json.load(open(sys.argv[1]))
N = int((E['dur'] + 0.5) * SR); mix = np.zeros(N)
db = lambda v: 10 ** (v / 20)
rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-12
peak = lambda x: np.max(np.abs(x)) + 1e-12
rng = np.random.default_rng(7)

def add(sig, t, g):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(sig)); mix[i:j] += sig[: j - i] * g

KALEM_DB = -58          # RMS hedefi: neredeyse duyulmaz
for t0, dur in E['kalem']:
    n = int(dur * SR); s = rng.integers(0, len(KALEM) - n - 1)
    seg = KALEM[s:s + n].copy(); f = min(int(0.05 * SR), n // 4)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    add(seg, t0, db(KALEM_DB) / rms(KALEM))
for t in E['gecis']: add(GECIS, t - 0.15, db(-16) / peak(GECIS))
for t in E['tik']: add(TIK, t, db(-14) / peak(TIK))

mix = np.clip(mix, -1, 1)
with wave.open(sys.argv[2], 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', len(mix) / SR, 's')
