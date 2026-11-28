#!/usr/bin/env python3
# Ajan anahtarı (UserPromptSubmit hook'u).
# Kullanıcı mesajında "ajanlar açık" / "ajanlar kapalı" (ve benzerleri) geçerse durumu .claude/ajanlar/durum.txt dosyasına yazar.
# Her mesajda mevcut durumu Claude'a bağlam olarak ekler. Varsayılan: KAPALI (kullanım hakkı boşa harcanmasın).
import json, os, re, sys

kok = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
klasor = os.path.join(kok, ".claude", "ajanlar")
dosya = os.path.join(klasor, "durum.txt")

try:
    veri = json.load(sys.stdin)
except Exception:
    veri = {}
mesaj = (veri.get("prompt") or "").lower()
# Türkçe harfleri sadeleştir (açık/acik, kapalı/kapali, ajanları/ajanlari)
sade = mesaj.translate(str.maketrans("çğıöşüâî", "cgiosuai"))

ac = re.search(r"\bajan(lar|lari)?\s+(acik|ac|aktif|calissin|baslat)\b", sade)
kapa = re.search(r"\bajan(lar|lari)?\s+(kapali|kapat|kapansin|pasif|durdur)\b", sade)

onceki = "KAPALI"
try:
    with open(dosya, encoding="utf-8") as f:
        onceki = f.read().strip() or "KAPALI"
except Exception:
    pass

durum, degisti = onceki, ""
if kapa:                      # ikisi birden geçerse güvenli taraf: kapalı
    durum, degisti = "KAPALI", "Kullanıcı bu mesajda ajanları KAPATTI."
elif ac:
    durum, degisti = "AÇIK", "Kullanıcı bu mesajda ajanları AÇTI."

if degisti:
    os.makedirs(klasor, exist_ok=True)
    with open(dosya, "w", encoding="utf-8") as f:
        f.write(durum + "\n")

if durum == "AÇIK":
    talimat = ("AJAN SİSTEMİ: AÇIK. Proje işlerinde .claude/ajanlar/AJANLAR.md'deki 4 ajanı (sahne–soru uyumu, grafik ve görsel, "
               "ÖSYM uyumu, fizik yasaları) ilgili işlere göre çalıştır; tanımdaki çalışma kurallarına uy.")
else:
    talimat = ("AJAN SİSTEMİ: KAPALI. Kullanıcı 'ajanlar açık' demedikçe hiçbir ajan (Agent/fork/alt ajan) BAŞLATMA, "
               "devam ettirme (SendMessage) ya da yeni iş verme; işleri kendin yap. Çalışan ajan varsa durdur (TaskStop).")
if degisti:
    talimat = degisti + " " + talimat

print(json.dumps({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": talimat}}, ensure_ascii=False))
