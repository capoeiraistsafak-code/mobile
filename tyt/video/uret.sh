#!/usr/bin/env bash
# Tuzak / test kağıdı videosu üretimi (sesli). Kullanım:
#   ./uret.sh <icerik> <sync> <ses_duz.wav> <cikti.mp4> [bolum] [hiz]
#   ör. tek parça:  ./uret.sh isi_tuzak sync_isi_tuzak ses_isi_tuzak_duz.wav ../kareler/isi_tuzak/tek.mp4
#       bölüm 1:    ./uret.sh isi_tuzak sync_isi_tuzak_b1 ses_isi_tuzak_duz.wav ../kareler/isi_tuzak/b1.mp4 1 1.3
set -euo pipefail
cd "$(dirname "$0")"
K="$1"; SY="$2"; SES="$3"; OUT="$4"; B="${5:-}"; HIZ="${6:-1}"
T="$(mktemp -d)"
export PAGE="$PWD/konu.html?m=test_motor&k=$K${B:+&b=$B}&s=$SY"
node olaylar.js "$T/ev.json"                       # zaman çizelgesi (yazı, çizgi, ✓, geçiş, takip kartı)
node rec.js 30 "$T/sessiz.mp4"                     # kareleri kaydet
python3 -I ses_konu.py "$T/ev.json" "$T/mix.wav" "$SES" "$SY.json"   # efektler + seslendirme
# hız: görüntü setpts, ses atempo (perde korunur); son karışım -14 LUFS
ffmpeg -nostdin -loglevel error -y -i "$T/sessiz.mp4" -i "$T/mix.wav" \
  -filter_complex "[0:v]setpts=PTS/$HIZ,fps=30[v];[1:a]atempo=$HIZ,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
rm -rf "$T"; echo "hazır: $OUT"
