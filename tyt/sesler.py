"""Efekt sesleri + fon müziği (insan sesi yok, ElevenLabs yok; hepsi burada sentezlenir).
Kullanım: python3 sesler.py <olaylar.json> <cikti.wav> [--fon 0|1]
olaylar.json: {"sure": sn, "olaylar": [{"tur": ..., "bas": sn, "sure": sn}]}
Türler: tik, pop, gir (vuuş), fosfor, yaz (kalem), ciz (kalem çizgi), uyari (tuzak), alev, su, hava, zil
"""
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
rng = np.random.default_rng(3)


def bp(x, lo, hi, o=4):
    return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def lp(x, f, o=4):
    return sosfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x)


def hp(x, f, o=4):
    return sosfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x)


def zarf(n, atak=.005, birak=.05):
    e = np.ones(n); a = min(n, max(1, int(atak * SR))); r = min(n, max(1, int(birak * SR)))
    e[:a] = np.linspace(0, 1, a); e[n - r:] *= np.linspace(1, 0, r); return e


def norm(x, db):
    m = np.max(np.abs(x)) or 1
    return x / m * 10 ** (db / 20)


def tik():
    n = int(.035 * SR); t = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 140), -20)


def pop():
    n = int(.14 * SR); t = np.arange(n) / SR
    f = 950 * np.exp(-t * 18) + 260
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 32)
    x += .25 * hp(rng.standard_normal(n), 3000) * np.exp(-t * 300)
    return norm(x, -12)


def gir(d=.45):
    n = int(d * SR); t = np.arange(n) / SR
    g = rng.standard_normal(n)
    x = bp(g, 400, 2500) * np.sin(np.pi * t / d) ** 2
    return norm(x, -21)


def fosfor(d=.9):  # keçeli kalemin kağıtta kayması
    n = int(d * SR); t = np.arange(n) / SR
    g = bp(rng.standard_normal(n), 1800, 5200)
    titresim = .65 + .35 * np.sin(2 * np.pi * 17 * t + rng.uniform(0, 6))
    x = g * titresim * zarf(n, .03, .08)
    x += .08 * np.sin(2 * np.pi * 1300 * t) * zarf(n, .03, .08)
    return norm(x, -17)


def kalem(d=1.4, yumusak=False):  # kurşun kalem cızırtısı: kısa darbeler
    n = int(d * SR); x = np.zeros(n); i = 0
    while i < n:
        L = int(rng.uniform(.06, .19) * SR); L = min(L, n - i)
        if L <= 10: break
        s = hp(rng.standard_normal(L), 2600 if not yumusak else 1500) * zarf(L, .01, .03)
        s *= rng.uniform(.6, 1.0) * (1 + .4 * np.sin(np.linspace(0, rng.uniform(3, 9), L)))
        x[i:i + L] += s
        i += L + int(rng.uniform(.015, .05) * SR)
    x = bp(x, 1500 if yumusak else 2500, 8000)
    return norm(x, -16 if not yumusak else -19)


def uyari():
    out = []
    for f, d in [(880, .16), (660, .3)]:
        n = int(d * SR); t = np.arange(n) / SR
        out.append((np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 9))
    return norm(np.concatenate(out), -14)


def alev():
    d = .9; n = int(d * SR); t = np.arange(n) / SR
    e = np.minimum(1, t / .08) * np.exp(-np.maximum(0, t - .08) * 3.2)
    x = lp(rng.standard_normal(n), 900) * e + .5 * np.sin(2 * np.pi * 70 * t) * e
    return norm(x, -13)


def su(d=4):  # borularda akan su: kahverengi gürültü + baloncuklar
    n = int(d * SR)
    x = np.cumsum(rng.standard_normal(n)); x -= np.convolve(x, np.ones(2000) / 2000, 'same')
    x = lp(x, 700) * .6
    for _ in range(int(d * 9)):
        b = rng.integers(0, n - 3000); L = int(rng.uniform(.03, .07) * SR); tt = np.arange(L) / SR
        f = rng.uniform(350, 900) * (1 + 2 * tt / tt[-1])
        x[b:b + L] += .5 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 40) * np.std(x)
    return norm(x * zarf(n, .3, .5), -24)


def hava(d=1.5):
    n = int(d * SR); t = np.arange(n) / SR
    return norm(bp(rng.standard_normal(n), 250, 1200) * np.sin(np.pi * t / d), -27)


def zil():
    d = 1.2; n = int(d * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(1318, 1), (1976, .5), (2637, .25)]) * np.exp(-t * 4)
    return norm(x, -18)


def fon(sure, db=-31):
    """Sakin fon müziği: Am–F–C–G pad + yumuşak arpej (100 bpm)."""
    n = int(sure * SR); x = np.zeros(n); t = np.arange(n) / SR
    akor = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]]
    olcu = 2.4
    for k in range(int(sure / olcu) + 1):
        a = int(k * olcu * SR); b = min(n, int((k + 1) * olcu * SR) + int(.4 * SR))
        if a >= n: break
        tt = np.arange(b - a) / SR; e = np.minimum(1, tt / .5) * np.minimum(1, (b - a) / SR - tt + .01)
        for f in akor[k % 4]:
            x[a:b] += .25 * (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.003 * tt)) * e
        adim = .3
        for j, f in enumerate([akor[k % 4][0] * 2, akor[k % 4][1] * 2, akor[k % 4][2] * 2, akor[k % 4][1] * 2] * 2):
            s = a + int(j * adim * SR)
            L = min(int(.5 * SR), n - s)
            if L <= 0: continue
            ts = np.arange(L) / SR
            x[s:s + L] += .18 * np.sin(2 * np.pi * f * ts) * np.exp(-ts * 7)
    x = lp(x, 3000)
    x *= np.minimum(1, t / 1.5) * np.minimum(1, (sure - t) / 1.5)
    return norm(x, db)


def main():
    olay = json.load(open(sys.argv[1])); cikti = sys.argv[2]
    fon_var = '--fon' not in sys.argv or sys.argv[sys.argv.index('--fon') + 1] != '0'
    sure = olay['sure'] + .5; n = int(sure * SR); mix = np.zeros(n)
    son_gir = -9
    for o in sorted(olay['olaylar'], key=lambda o: o['bas']):
        tur, bas, d = o['tur'], o['bas'], o.get('sure', .5)
        if tur == 'gir':
            if bas - son_gir < .25: continue
            son_gir = bas; s = gir()
        elif tur == 'pop': s = pop()
        elif tur == 'tik': s = tik()
        elif tur == 'fosfor': s = fosfor(d)
        elif tur == 'yaz': s = kalem(d)
        elif tur == 'ciz': s = kalem(d, yumusak=True)
        elif tur == 'uyari': s = uyari()
        elif tur == 'alev': s = alev()
        elif tur == 'su': s = su(d)
        elif tur == 'hava': s = hava(d)
        elif tur == 'zil': s = zil()
        else: continue
        a = int(bas * SR); b = min(n, a + len(s)); mix[a:b] += s[:b - a]
    if fon_var: mix += fon(sure)
    mix = mix / max(1, np.max(np.abs(mix)) / .95)
    pcm = (mix * 32767).astype(np.int16)
    import wave
    with wave.open(cikti, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('ses', cikti, f'{sure:.1f} sn')


if __name__ == '__main__':
    main()
