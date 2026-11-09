"""Seslendirme temizleme ve parlatma zinciri (Instagram için).
Kullanım: python3 temizle.py giris.(wav|mp3) cikis.wav [profil]
Adımlar: alçak uğultuyu kes → gürültü azalt → duraklamalarda gürültü kapısı → boğukluğu kıs, netliği aç →
tiz cızırtıyı yumuşat → s seslerini yumuşat → hafif sıkıştırma (vurgular korunur) → iki aşamalı ses seviyesi (-14 LUFS, -1.5 dBTP)"""
import sys, subprocess, json, re
src, out = sys.argv[1], sys.argv[2]
prof = sys.argv[3] if len(sys.argv) > 3 else 'ham'
P = {
 'v3': "highpass=f=90,afftdn=nr=12:nf=-50:tn=1,agate=threshold=0.012:ratio=4:attack=4:release=180:range=0.05:knee=3,"
       "equalizer=f=250:t=q:w=1.0:g=-3.5,equalizer=f=2800:t=q:w=1.2:g=3.5,equalizer=f=5000:t=q:w=1.5:g=1.5,"
       "highshelf=f=7500:g=-7,deesser=i=0.45,acompressor=threshold=-16dB:ratio=2:attack=10:release=120:knee=4",
 'v4': "highpass=f=90,afftdn=nr=14:nf=-50:tn=1,agate=threshold=0.015:ratio=5:attack=3:release=200:range=0.03:knee=3,"
       "equalizer=f=220:t=q:w=1.0:g=-3,equalizer=f=450:t=q:w=1.2:g=-1.5,equalizer=f=2800:t=q:w=1.2:g=3.5,equalizer=f=4800:t=q:w=1.6:g=2,"
       "highshelf=f=7500:g=-8,lowpass=f=12000,deesser=i=0.5,acompressor=threshold=-15dB:ratio=1.8:attack=12:release=140:knee=5",
 'v5': "highpass=f=90,afftdn=nr=14:nf=-50:tn=1,agate=threshold=0.015:ratio=5:attack=3:release=200:range=0.03:knee=3,"
       "equalizer=f=220:t=q:w=1.0:g=-3.5,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=1800:t=q:w=1.0:g=1,equalizer=f=3000:t=q:w=1.2:g=4.5,equalizer=f=4800:t=q:w=1.6:g=2.5,"
       "highshelf=f=7200:g=-9,lowpass=f=12000,deesser=i=0.55,acompressor=threshold=-15dB:ratio=1.8:attack=12:release=140:knee=5",
 'v6': "highpass=f=90,afftdn=nr=18:nf=-46:tn=1,agate=threshold=0.022:ratio=8:attack=3:release=160:range=0.015:knee=2,"
       "equalizer=f=220:t=q:w=1.0:g=-3.5,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=1800:t=q:w=1.0:g=1,equalizer=f=3000:t=q:w=1.2:g=4.5,equalizer=f=4800:t=q:w=1.6:g=2.5,"
       "highshelf=f=7200:g=-9,lowpass=f=12000,deesser=i=0.55,acompressor=threshold=-13dB:ratio=1.5:attack=15:release=150:knee=6",
 'v7': "highpass=f=90,afftdn=nr=18:nf=-46:tn=1,agate=threshold=0.016:ratio=6:attack=2:release=300:range=0.02:knee=4,"
       "equalizer=f=220:t=q:w=1.0:g=-3.5,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=1800:t=q:w=1.0:g=1,equalizer=f=3000:t=q:w=1.2:g=4.5,equalizer=f=4800:t=q:w=1.6:g=2.5,"
       "highshelf=f=7200:g=-9,lowpass=f=12000,deesser=i=0.55,acompressor=threshold=-13dB:ratio=1.5:attack=15:release=150:knee=6",
 'v8': "highpass=f=90,afftdn=nr=18:nf=-46:tn=1,agate=threshold=0.024:ratio=6:attack=2:release=260:range=0.02:knee=4,"
       "equalizer=f=220:t=q:w=1.0:g=-3.5,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=1800:t=q:w=1.0:g=1,equalizer=f=3000:t=q:w=1.2:g=4.5,equalizer=f=4800:t=q:w=1.6:g=2.5,"
       "highshelf=f=7200:g=-9,lowpass=f=12000,deesser=i=0.55,acompressor=threshold=-13dB:ratio=1.5:attack=15:release=150:knee=6",
 'ham': "highpass=f=60",
 'iso': "highpass=f=90,agate=threshold=0.01:ratio=3:attack=4:release=200:range=0.06:knee=3,"
       "equalizer=f=220:t=q:w=1.0:g=-3,equalizer=f=450:t=q:w=1.2:g=-1.5,equalizer=f=2800:t=q:w=1.2:g=3.5,equalizer=f=4800:t=q:w=1.6:g=2,"
       "highshelf=f=7500:g=-5,lowpass=f=13000,deesser=i=0.4,acompressor=threshold=-15dB:ratio=1.8:attack=12:release=140:knee=5",
}.get(prof, '')
if prof == 'oto':
    # kapı eşiği bu çekimin kendi gürültü tabanına göre: tabanın ~8 dB üstü (gürültü kesilir, yumuşak heceler kalır)
    import wave, numpy as np, tempfile, os
    tmp = tempfile.mktemp(suffix='.wav')
    pre = "highpass=f=90,afftdn=nr=18:nf=-46:tn=1"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af', pre, '-ac', '1', '-ar', '44100', tmp], check=True)
    w = wave.open(tmp); x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768; os.remove(tmp)
    h = int(0.03 * 44100); r_ = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)])
    floor = np.percentile(r_[r_ > 1e-6], 10); thr = float(np.clip(floor * 2.5, 0.006, 0.03))
    P = (pre + f",agate=threshold={thr:.4f}:ratio=6:attack=2:release=260:range=0.02:knee=4,"
         "equalizer=f=220:t=q:w=1.0:g=-3.5,equalizer=f=450:t=q:w=1.2:g=-2,equalizer=f=1800:t=q:w=1.0:g=1,equalizer=f=3000:t=q:w=1.2:g=4.5,equalizer=f=4800:t=q:w=1.6:g=2.5,"
         "highshelf=f=7200:g=-9,lowpass=f=12000,deesser=i=0.55,acompressor=threshold=-13dB:ratio=1.5:attack=15:release=150:knee=6")
    print('kapı eşiği', round(thr, 4))
r = subprocess.run(['ffmpeg', '-hide_banner', '-y', '-i', src, '-af', P + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af', P + ',' + ln, '-ar', '44100', '-ac', '1', out], check=True)
print('hazır', out)
