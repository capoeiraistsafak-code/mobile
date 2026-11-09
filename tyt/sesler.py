"""Konu anlatımı efekt sesleri — "Konu Anlatımı" oturumundaki ses_konu.py ile aynı yöntem ve seviyeler.
Kayıtlar (kullanıcının yüklediği dosyalar) tyt/sesler/ klasöründe:
  kalem.wav  ← "Kalem yazma sesi.mp3"   (kalem yazarken doğal parçalar; düz çizgide düzleştirilmiş sürtünme)
  gecis.wav  ← "Geçiş 1.mp3"            (bölüm / sayfa geçişi)
  tik.wav    ← "Tıklama sesi.mp3"       (Takip Et kartı çıkınca ve butona tıklanınca)
Yeşil ✓ için yumuşak tık sentezlenir. Fon müziği yok; insan sesi yok.
Kullanım: python3 sesler.py olaylar.json cikis.wav
olaylar.json: {"sure": sn, "olaylar": [{"tur": yaz|ciz|fosfor|onay|gecis|takip, "bas": sn, "sure": sn}]}
"""
import json, sys, wave, os
import numpy as np

SR = 44100
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sesler')


def load(name):
    w = wave.open(os.path.join(D, name)); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768.0
    if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    return x.astype(float)


KALEM, GECIS, TIK = load('kalem.wav'), load('gecis.wav'), load('tik.wav')
E = json.load(open(sys.argv[1])); out = sys.argv[2]
rng = np.random.default_rng(7)
N = int((E['sure'] + 1.5) * SR); mix = np.zeros(N)
db = lambda v: 10 ** (v / 20)
rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-12
peak = lambda x: np.max(np.abs(x)) + 1e-12


def add(sig, t, g):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(sig)); mix[i:j] += sig[: j - i] * g


def smooth(x, n):
    return np.convolve(x, np.ones(n) / n, 'same')


env_k = np.sqrt(smooth(KALEM ** 2, int(0.05 * SR)))
live = env_k > db(-50)


def take(dur):
    n = min(int(dur * SR), len(KALEM) - 2)
    for _ in range(50):
        i = int(rng.integers(0, len(KALEM) - n - 1))
        if live[i:i + n].mean() > 0.8: return KALEM[i:i + n].copy()
    return KALEM[:n].copy()


def fade(x, a=0.03, b=0.06):
    n = len(x); e = np.ones(n); na, nb = min(n // 2, int(a * SR)), min(n // 2, int(b * SR))
    e[:na] = np.linspace(0, 1, na); e[n - nb:] = np.linspace(1, 0, nb); return x * e


def write_sound(dur):          # doğal yazı: kaydın kendi ritmi
    x = take(dur); return fade(x / rms(x) * db(-30))


def line_sound(dur, seviye=-32):  # dalgalanma düzleştirilmiş tek düze sürtünme
    x = take(dur); e = np.sqrt(smooth(x ** 2, int(0.03 * SR))) + 1e-4
    y = smooth(x / e, 3)
    return fade(y / rms(y) * db(seviye), 0.04, 0.08)


def check_click():
    n = int(0.09 * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 1250 * tt) + 0.25 * np.sin(2 * np.pi * 2512 * tt)) * np.exp(-tt / 0.018) * np.minimum(1, tt / 0.004)
    return s / peak(s)


for o in E['olaylar']:
    tur, a, d = o['tur'], o['bas'], o.get('sure', .5)
    if tur == 'yaz': add(write_sound(d + 0.05), a, 1.0)
    elif tur == 'ciz': add(line_sound(d + 0.05), a, 1.0)
    elif tur == 'fosfor': add(line_sound(d + 0.05, -36), a, 1.0)
    elif tur == 'onay': add(check_click(), a + 0.12, db(-12))
    elif tur == 'gecis': add(GECIS / peak(GECIS), a, db(-8))
    elif tur == 'takip':
        add(TIK / peak(TIK), a + 0.02, db(-9))   # kart çıkınca
        add(TIK / peak(TIK), a + 1.0, db(-7))    # Takip Et'e tıklanınca

mix = np.tanh(mix / 0.95) * 0.95                  # yumuşak sınırlayıcı
pcm = (np.stack([mix, mix], 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ses hazır', out, round(len(mix) / SR, 1), 'sn')
