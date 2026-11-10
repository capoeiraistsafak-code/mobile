"""Seslendirmede her paragrafın (giriş, soru 1-10, kapanış) başladığı saniyeyi bulur.

Kullanım:  python3 araclar/ses_sinirlari.py seslendirme.mp3 metin.txt
metin.txt: paragraflar arasında boş satır olan, seslendirmede okunan metnin aynısı.
Sonuç sinirlar.txt dosyasına yazılır (soru 1..10 ve kapanışın başlangıçları).
"""
import re, subprocess, sys

audio, text = sys.argv[1], sys.argv[2]
paras = [p for p in open(text, encoding="utf-8").read().split("\n\n") if p.strip()]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio],
                           capture_output=True, text=True).stdout)
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", audio, "-af", "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]
sil = [(s, e, e - s) for s, e in zip(starts, ends)]
L = [len(p) for p in paras]
tot = sum(L)
exp, c = [], 0
for l in L[:-1]:
    c += l
    exp.append(c / tot * dur)
K, n = len(exp), len(sil)
if n < K:
    sys.exit(f"Yeterli duraklama bulunamadı ({n} < {K}). Paragraflar arasında daha uzun durak bırakın.")


def cost(j, k):  # beklenen yere yakın ve uzun duraklamalar tercih edilir
    s, e, d = sil[j]
    return abs((s + e) / 2 - exp[k]) / 4 - d * 3


INF = 1e9
dp = [[INF] * n for _ in range(K)]
prv = [[-1] * n for _ in range(K)]
for j in range(n):
    dp[0][j] = cost(j, 0)
for k in range(1, K):
    for j in range(n):
        for i in range(j):
            v = dp[k - 1][i] + cost(j, k)
            if v < dp[k][j]:
                dp[k][j], prv[k][j] = v, i
j = min(range(n), key=lambda j: dp[K - 1][j])
sel = []
for k in range(K - 1, -1, -1):
    sel.append(j)
    j = prv[k][j]
sel.reverse()
for k, j in enumerate(sel):
    print(f"Paragraf {k + 2:2d}: beklenen {exp[k]:6.1f} sn, bulunan {sil[j][1]:6.1f} sn (durak {sil[j][2]:.2f} sn)")
open(sys.argv[3] if len(sys.argv) > 3 else "sinirlar.txt", "w").write(" ".join(f"{sil[j][1]:.2f}" for j in sel))
print("sinirlar.txt yazıldı. Beklenen ile bulunan arasında büyük fark varsa kontrol edin.")
