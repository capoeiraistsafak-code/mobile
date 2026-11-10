"""Seslendirme kalite ölçümü: python3 olc.py dosya.wav [dosya2.wav ...]
Ölçüler:
  LUFS        tümleşik ses yüksekliği (Instagram hedefi ≈ -14)
  taban dB    duraklamalardaki gürültü tabanı (düşük = temiz; -60 altı çok iyi)
  SNR dB      konuşma ile taban arasındaki fark (yüksek = temiz)
  netlik dB   2-5 kHz enerjisinin 150-800 Hz'e oranı (çok düşük = boğuk; ≈ -6..0 iyi)
  çınlama dB  7-12 kHz'in 2-5 kHz'e oranı (yüksek = cızırtı/çınlama)
  perde st    ses perdesinin yarım ton cinsinden yayılımı (canlılık; 2.5+ canlı, <1.8 düz)
  vurgu dB    konuşma anındaki ses seviyesi dalgalanması (canlılık; 5+ vurgulu)
  tık         ani sıçrama sayısı
"""
import sys, subprocess, re, wave
import numpy as np

def load(p):
    if not p.endswith('.wav'):
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-ac', '1', '-ar', '44100', '/tmp/_olc.wav']); p = '/tmp/_olc.wav'
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    if w.getnchannels() == 2: x = x[::2]
    return x, w.getframerate(), p

def lufs(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); return float(m[-1]) if m else float('nan')

def f0(fr, sr):
    fr = fr - fr.mean(); ac = np.correlate(fr, fr, 'full')[len(fr) - 1:]
    lo, hi = int(sr / 350), int(sr / 70)
    if ac[0] <= 0: return None
    k = lo + np.argmax(ac[lo:hi]); return sr / k if ac[k] / ac[0] > 0.45 else None

def olc(path):
    x, sr, p = load(path); h = int(0.03 * sr)
    fr = [x[i:i + h] for i in range(0, len(x) - h, h)]
    db = np.array([20 * np.log10(np.sqrt(np.mean(f ** 2)) + 1e-9) for f in fr])
    sp = db > np.percentile(db, 60) - 6
    floor = np.percentile(db, 8); top = np.percentile(db[sp], 90)
    F = np.fft.rfftfreq(h, 1 / sr)
    def band(f, a, b): S = np.abs(np.fft.rfft(f * np.hanning(len(f)))) ** 2; return S[(F >= a) & (F < b)].sum() + 1e-12
    vf = [f for f, s in zip(fr, sp) if s]
    clar = 10 * np.log10(sum(band(f, 2000, 5000) for f in vf) / sum(band(f, 150, 800) for f in vf))
    ring = 10 * np.log10(sum(band(f, 7000, 12000) for f in vf) / sum(band(f, 2000, 5000) for f in vf))
    hp = int(0.04 * sr); pitches = []
    for i in range(0, len(x) - hp, hp // 2):
        seg = x[i:i + hp]
        if 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9) > top - 18:
            v = f0(seg, sr)
            if v: pitches.append(v)
    pitches = np.array(pitches); st = 12 * np.log2(pitches / np.median(pitches)) if len(pitches) else np.array([0])
    st = st[np.abs(st) < 12]
    d = np.abs(np.diff(x)); clicks = int(np.sum(d > max(0.25, 12 * np.median(d) * 40)))
    return dict(LUFS=round(lufs(p), 1), taban=round(floor, 1), SNR=round(top - floor, 1), netlik=round(clar, 1), cinlama=round(ring, 1),
                perde=round(float(np.std(st)), 2), vurgu=round(float(np.std(db[sp])), 1), tik=clicks, sure=round(len(x) / sr, 1))

if __name__ == '__main__':
    print(f"{'dosya':38s} {'LUFS':>6} {'taban':>6} {'SNR':>5} {'netlik':>7} {'çınlama':>8} {'perde':>6} {'vurgu':>6} {'tık':>4} {'süre':>5}")
    for p in sys.argv[1:]:
        r = olc(p)
        print(f"{p[-38:]:38s} {r['LUFS']:6} {r['taban']:6} {r['SNR']:5} {r['netlik']:7} {r['cinlama']:8} {r['perde']:6} {r['vurgu']:6} {r['tik']:4} {r['sure']:5}")
