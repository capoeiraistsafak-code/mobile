#!/bin/bash
# Yeni oturumda bir kez çalıştırın: Manim, ffmpeg ve el yazısı fontunu kurar.
set -e
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libpango1.0-dev libcairo2-dev pkg-config python3-dev ffmpeg >/dev/null
python3 -m venv ~/manim-venv
~/manim-venv/bin/pip install -q --upgrade pip
~/manim-venv/bin/pip install -q manim
mkdir -p ~/.fonts
curl -sSfL -o ~/.fonts/Caveat.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/Caveat%5Bwght%5D.ttf"
fc-cache -f >/dev/null
~/manim-venv/bin/python -c "import manim; print('Manim', manim.__version__, 'hazır')"
fc-list | grep -qi caveat && echo "Caveat fontu hazır"
