#!/bin/sh
# Kullanım: sh pano.sh <konu>  → kareler/<konu>/pano.png (tüm kareler tek görselde)
cd "$(dirname "$0")/kareler/$1" && ffmpeg -loglevel error -y -pattern_type glob -i '[0-9]*.png' \
  -vf "scale=432:768,tile=5x2:padding=12:color=0x111111" -frames:v 1 pano.png
