#!/bin/bash
# ./render.sh onizleme  -> 540x960 hızlı önizleme
# ./render.sh instagram -> 1080x1920 30fps, H.264 + sessiz AAC iz (Instagram Reels uyumlu)
set -e
cd "$(dirname "$0")"
M=~/manim-venv/bin/manim
case "$1" in
  onizleme) $M -r 540,960 --fps 15 --media_dir media atis_el.py AtisEl
            echo "media/videos/atis_el/960p15/AtisEl.mp4" ;;
  instagram)
    $M -r 1080,1920 --fps 30 --media_dir media atis_el.py AtisEl
    ffmpeg -loglevel error -y -i media/videos/atis_el/1920p30/AtisEl.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo \
      -map 0:v -map 1:a -shortest -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -level 4.1 \
      -r 30 -c:a aac -b:a 128k -movflags +faststart 11Sinif_Atislar_Soru1_Instagram.mp4
    echo "Hazır: 11Sinif_Atislar_Soru1_Instagram.mp4" ;;
  *) echo "Kullanım: ./render.sh onizleme | instagram" ;;
esac
