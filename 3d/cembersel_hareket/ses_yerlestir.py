"""Seslendirmeyi paragraflara böler, her paragrafı kendi sahnesinin başına yerleştirir.
Ses ham kalır; yalnızca 60 Hz altı kesilir (TYT formatı).
Kullanım: python3 -I ses_yerlestir.py ses/ses_orijinal.wav ses/sinirlar.json olaylar.json seslendirme_yerlesik.wav
"""
import json, sys, wave
import numpy as np

src, sinir, olay, out = sys.argv[1:5]
w = wave.open(src); SR = w.getframerate(); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768.0
if ch == 2: x = x.reshape(-1, 2).mean(1)
B = [0.0] + json.load(open(sinir)) + [len(x) / SR]
E = json.load(open(olay))
starts = [b[1] for b in E['bolum']]
N = int((E['dur'] + 0.5) * SR); mix = np.zeros(N)
LEAD = 0.25                                   # sahne başladıktan sonra konuşma başlar
for i in range(len(B) - 1):
    a, b = int(B[i] * SR), int(B[i + 1] * SR)
    seg = x[a:b].copy(); f = int(0.03 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    t = starts[i] + (LEAD if i else 0.15)
    j = int(t * SR); k = min(N, j + len(seg)); mix[j:k] += seg[: k - j]
# 60 Hz altı kesim (tek kutuplu yüksek geçiren)
rc = 1 / (2 * np.pi * 60); dt = 1 / SR; al = rc / (rc + dt); y = np.zeros_like(mix)
for n in range(1, len(mix)): y[n] = al * (y[n - 1] + mix[n] - mix[n - 1])
y = np.clip(y, -1, 1)
with wave.open(out, 'w') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((y * 32767).astype(np.int16).tobytes())
print('ok', round(len(y) / SR, 2), 's')
