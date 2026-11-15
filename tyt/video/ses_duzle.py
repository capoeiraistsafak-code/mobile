"""Seslendirmede paragraflar arası ani seviye sıçramasını yumuşatır (ses fırlamasın).
Her paragrafın ortanca seviyesi, tüm paragrafların ortancasının ±2 dB'si içine çekilir; kesimler sessizlikte, 50 ms geçişle.
Tını ve tonlama değişmez, yalnızca seviye. Kullanım: python3 -I ses_duzle.py ses.wav sync_<konu>.json ses_duz.wav"""
import json, sys, wave
import numpy as np
w = wave.open(sys.argv[1]); SR = w.getframerate(); X = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0
clips = json.load(open(sys.argv[2])); h = int(0.4 * SR)
def med(a, b):
    s = X[int(a * SR):int(b * SR)]; n = len(s) // h
    r = 20 * np.log10(np.sqrt(np.mean(s[:n * h].reshape(n, h) ** 2, axis=1)) + 1e-9); return np.median(r[r > -45])
M = [med(c['a'], c['b']) for c in clips]; G = np.median(M)
g = np.ones(len(X))
for c, m in zip(clips, M):
    g[int(c['a'] * SR):min(len(X), int(c['b'] * SR))] = 10 ** ((min(max(m, G - 2), G + 2) - m) / 20)
r = int(0.05 * SR); g = np.convolve(g, np.ones(r) / r, 'same')
Y = np.clip(X * g, -1, 1)
o = wave.open(sys.argv[3], 'w'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((Y * 32767).astype(np.int16).tobytes()); o.close()
print('paragraflar arası en büyük fark: önce %.1f dB' % max(abs(M[i] - M[i - 1]) for i in range(1, len(M))))
