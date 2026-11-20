#!/bin/bash
# Ödev Kontrol – Mac için başlatma dosyası (çift tıklayın).
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js kurulu değil. https://nodejs.org adresinden LTS sürümünü kurup bu dosyayı tekrar açın."
  open https://nodejs.org
  read -r -p "Kapatmak için Enter'a basın."
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "İlk çalıştırma: gerekli parçalar indiriliyor, birkaç dakika sürebilir..."
  npm install || { read -r -p "Kurulum başarısız oldu. Enter'a basın."; exit 1; }
fi
echo
echo "Ödev Kontrol açılıyor. Bu pencereyi KAPATMAYIN; kapatırsanız program durur."
echo
(sleep 4; open http://localhost:3000) &
npm start
