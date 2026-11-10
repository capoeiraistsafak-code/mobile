#!/bin/bash
# Soru Videosu 2. Format üretim betiği
#   ./render2.sh 9 onizleme   -> 540x960 sessiz önizleme (cikti/Fizik9_onizleme.mp4)
#   ./render2.sh 9 sesli      -> ses/ses_9.mp3 ile senkron 1080x1920 Instagram videosu (cikti/Fizik9_Instagram.mp4)
#   ./render2.sh hepsi sesli  -> 9, 10, 11, 12 hepsi sırayla
set -e
cd "$(dirname "$0")"
M=~/manim-venv/bin/manim
PY=~/manim-venv/bin/python
if [ "$1" = "hepsi" ]; then for g in 9 10 11 12; do "$0" $g "$2"; done; exit 0; fi
G=$1; MODE=$2; MD=media_$G
case "$MODE" in
  onizleme)
    $M -r 540,960 --fps 15 --media_dir $MD fizik$G.py Fizik$G
    cp $MD/videos/fizik$G/960p15/Fizik$G.mp4 cikti/Fizik${G}_onizleme.mp4
    echo "Hazır: cikti/Fizik${G}_onizleme.mp4" ;;
  sesli)
    A=ses/ses_$G.mp3
    [ -f "$A" ] || { echo "Ses dosyası yok: $A"; exit 1; }
    [ -f sinirlar_$G.txt ] || $PY araclar/ses_sinirlari.py "$A" metinler/ses_$G.txt sinirlar_$G.txt
    F2_OLC=1 $M --dry_run -ql --media_dir $MD fizik$G.py Fizik$G >/dev/null 2>&1
    echo "Doğal süreler: $(cat nat_$G.json)"
    $M -r 1080,1920 --fps 30 --media_dir $MD fizik$G.py Fizik$G
    V=$MD/videos/fizik$G/1920p30/Fizik$G.mp4
    ffmpeg -loglevel error -y -i $V -i "$A" -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=6[v]" \
      -map "[v]" -map 1:a -shortest -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -level 4.1 -r 30 \
      -c:a aac -b:a 192k -ar 48000 -movflags +faststart cikti/Fizik${G}_NormalHiz.mp4
    D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 cikti/Fizik${G}_NormalHiz.mp4)
    K=$(python3 -c "print(round(max(1.0, $D/178.0), 4))")
    echo "Süre: $D sn, hız katsayısı: $K"
    if [ "$K" = "1.0" ]; then cp cikti/Fizik${G}_NormalHiz.mp4 cikti/Fizik${G}_Instagram.mp4; else
      ffmpeg -loglevel error -y -i cikti/Fizik${G}_NormalHiz.mp4 -filter_complex "[0:v]setpts=PTS/$K,fps=30[v];[0:a]atempo=$K[a]" \
        -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 \
        -movflags +faststart cikti/Fizik${G}_Instagram.mp4; fi
    echo "Hazır: cikti/Fizik${G}_Instagram.mp4" ;;
  *) echo "Kullanım: ./render2.sh <9|10|11|12|hepsi> <onizleme|sesli>" ;;
esac
