# Efekt kayıtları

"Konu Anlatımı" oturumunda kullanılan kayıtların aynısı buraya konur (mono, 44,1 kHz WAV):

| Dosya | Kaynak kayıt | Kullanım |
|---|---|---|
| `kalem.wav` | Kalem yazma sesi.mp3 | Kalem notu yazılırken; düz çizgi ve fosforda düzleştirilmiş hâli |
| `gecis.wav` | Geçiş 1.mp3 | Bölüm / sayfa geçişi |
| `tik.wav` | Tıklama sesi.mp3 | Takip Et kartı çıkınca ve tıklanınca |

Dönüştürme: `ffmpeg -i "Kalem yazma sesi.mp3" -ac 1 -ar 44100 kalem.wav`
