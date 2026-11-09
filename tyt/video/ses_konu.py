"""Konu anlatımı videosu efekt sesleri (yüklenen kayıtlarla).
- Kalem yazarken: 'Kalem yazma sesi' kaydından doğal parçalar (harf ritmiyle hafif kabarır)
- Kalemle düz çizgi çekerken: aynı kaydın dalgalanması düzleştirilmiş, tek düze sürtünme
- Takip Et kartı çıkınca ve butona tıklanınca: 'Tıklama sesi'
- Sayfa / adım geçişinde: 'Geçiş 1'
- Yeşil ✓: önceki formattaki yumuşak tık (sentez)
Kullanım: python3 ses_konu.py events.json cikis.wav [seslendirme.wav kesimler.json]
"""
import json, sys, wave, os
import numpy as np

SR = 44100
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sesler')
def load(name):
    w = wave.open(os.path.join(D, name)); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0
    return x.astype(float)
KALEM, GECIS, TIK = load('kalem.wav'), load('gecis.wav'), load('tik.wav')
E = json.load(open(sys.argv[1])); out = sys.argv[2]
rng = np.random.default_rng(7)
N = int((E['dur'] + 1.5) * SR); mix = np.zeros(N)
db = lambda v: 10 ** (v / 20)
rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-12
peak = lambda x: np.max(np.abs(x)) + 1e-12

def add(sig, t, g):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(sig)); mix[i:j] += sig[: j - i] * g

def smooth(x, n):
    k = np.ones(n) / n; return np.convolve(x, k, 'same')

# kalem kaydında sessiz olmayan bölge (gürültü tabanının üstü) içinden parça seç
env_k = np.sqrt(smooth(KALEM ** 2, int(0.05 * SR)))
live = env_k > db(-50)
pos = [0]
def take(dur):
    n = int(dur * SR)
    for _ in range(50):
        i = int(rng.integers(0, len(KALEM) - n - 1))
        if live[i:i + n].mean() > 0.8: return KALEM[i:i + n].copy()
    return KALEM[:n].copy()

def fade(x, a=0.03, b=0.06):
    n = len(x); e = np.ones(n); na, nb = min(n // 2, int(a * SR)), min(n // 2, int(b * SR))
    e[:na] = np.linspace(0, 1, na); e[n - nb:] = np.linspace(1, 0, nb); return x * e

def write_sound(dur):
    x = take(dur); return fade(x / rms(x) * db(-40.4))            # doğal yazı: kaydın kendi ritmi

def line_sound(dur):
    x = take(dur); e = np.sqrt(smooth(x ** 2, int(0.03 * SR))) + 1e-4
    y = x / e                                                   # dalgalanmayı düzleştir → tek düze sürtünme
    y = smooth(y, 3)
    return fade(y / rms(y) * db(-42.4), 0.04, 0.08)

def check_click():
    n = int(0.09 * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 1250 * tt) + 0.25 * np.sin(2 * np.pi * 2512 * tt)) * np.exp(-tt / 0.018) * np.minimum(1, tt / 0.004)
    return s / peak(s)

for a, b, kind, chars in E['writes']:
    if kind == 'line': add(line_sound(b - a + 0.05), a, 1.0)
    else: add(write_sound(b - a + 0.05), a, 1.0)
for t in E['checks']: add(check_click(), t + 0.12, db(-12))
for a, b in E['moves']: add(GECIS / peak(GECIS), a, db(-11))
for f in E['follows']:
    add(TIK / peak(TIK), f + 0.02, db(-12))   # kart çıkınca
    add(TIK / peak(TIK), f + 1.0, db(-10))    # Takip Et'e tıklanınca

# seslendirme: her paragraf kesimi, motorun verdiği bölüm başlangıcına yerleşir
if len(sys.argv) > 4:
    w = wave.open(sys.argv[3]); V = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0
    # çınlamayı azalt: 9 kHz üstünü yumuşakça kıs (ses netliği bozulmaz)
    # ses ham kalır (kullanıcı tercihi): yalnızca 60 Hz altı uğultu kesilir; seviye son aşamada -14 LUFS'e getirilir
    Fv = np.fft.rfft(V); fr = np.fft.rfftfreq(len(V), 1 / SR); Fv *= np.clip((fr - 40) / 20, 0, 1); V = np.fft.irfft(Fv, len(V))
    V = V / peak(V) * db(-3)
    for c in json.load(open(sys.argv[4])):
        seg = V[int(c['a'] * SR):int(c['b'] * SR)].copy(); n = min(len(seg) // 2, int(0.015 * SR))
        seg[:n] *= np.linspace(0, 1, n); seg[-n:] *= np.linspace(1, 0, n)
        add(seg, E['segs'][c['id']], 1.0)

mix = np.tanh(mix / 0.95) * 0.95                                # yumuşak sınırlayıcı
pcm = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ses hazır', out, round(len(mix) / SR, 1), 'sn')
