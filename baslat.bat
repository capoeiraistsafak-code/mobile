@echo off
chcp 65001 >nul
title Odev Kontrol
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js kurulu degil. https://nodejs.org adresinden LTS surumunu kurup bu dosyayi tekrar acin.
  start "" https://nodejs.org
  pause
  exit /b
)
if not exist node_modules (
  echo Ilk calistirma: gerekli parcalar indiriliyor, birkac dakika surebilir...
  call npm install
  if errorlevel 1 (
    echo Kurulum basarisiz oldu. Internet baglantinizi kontrol edin.
    pause
    exit /b
  )
)
echo.
echo Odev Kontrol aciliyor. Bu pencereyi KAPATMAYIN; kapatirsaniz program durur.
echo.
start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm start
pause
