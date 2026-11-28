# Fizik Oyunları — 4 Ajan (çalışan) sistemi

Açma / kapama: kullanıcı mesajında **"ajanlar açık"** yazınca açılır, **"ajanlar kapalı"** yazınca kapanır
(benzer ifadeler de geçer: "ajanları aç", "ajanları kapat", "ajanlar aktif / pasif", "ajanları durdur").
Durum `.claude/ajanlar/durum.txt` dosyasında tutulur (depoya girmez). **Varsayılan: KAPALI.**
Anahtar `.claude/settings.json` içindeki UserPromptSubmit hook'u ile çalışır (`.claude/ajanlar/ajan_anahtar.py`).

## Kurallar
- **KAPALI iken:** hiçbir ajan başlatılmaz, devam ettirilmez, iş verilmez; çalışan ajanlar durdurulur. Bütün işi ana oturum yapar (kullanım hakkı korunur).
- **AÇIK iken:** ana oturum işi ilgili ajan(lar)a dağıtır; ajanlar ana oturumun kopyasıdır (fork) ve proje bağlamını bilir.
  Kullanıcıyla birlikte projeyi tasarlar, eksikleri tamamlar.
- Her ajan **ayrı git worktree'de** çalışır; tablet tek dosyasını ve ZIP'i yenilemez, **push etmez**; kendi dalında commit eder.
  Ana oturum değişiklikleri birleştirir, bütün görevleri test eder (notdok + gtest), tablet sürümünü ve ZIP'i üretir, push eder.
- Ajanlar CLAUDE.md'deki bütün kurallara (fizik birebir uyum, ipucu yok, kesir yazımı, taşma yok, gerçekçi cisimler, telif) uyar.
  **ElevenLabs araçlarını asla çağırmaz.**
- Ajan yalnız kendi alanında değişiklik yapar; başka alana dair gözlemlerini raporuna yazar.
- Rapor: worktree/dal, commitler, yapılanlar, çözülemeyenler, diğer ajanlara notlar — kısa ve maddeli.

## Ajanlar
1. **Ajan 1 — Sahne–soru–konu uyumu:** Her soru/adımın 3D sahnesi soruda anlatılan düzenekle, sayılarla ve konuyla uyumlu mu;
   temsilî gösterimler, sahnedeki etiket/sayıların soruyla aynı olması, alt yazının çelişmemesi, cevaptan önce sahnenin cevabı ele vermemesi.
   Uyumsuzsa sahneyi soruya göre kurar / yeni mod ya da düzenek yazar / gerekirse soruyu sahneye uyarlar.
2. **Ajan 2 — Grafik ve görsel gerçekçilik:** Grafiklerin (x–t, v–t, a–t, m–V, F–x, T–Q, P–V, panolar, osilogram) doğru hesaplanması,
   eksen/birim/ölçek, taşma ve çakışmalar; cisimlerin gerçekçiliği (kural 12), kamera kadrajı, okunabilirlik.
3. **Ajan 3 — ÖSYM uyumu:** Soru kökü ÖSYM dili ve tek anlamlılık, 5 seçenek (A–E) ve makul çeldiriciler, öncüllü (I–II–III) soru tipi,
   müfredata (MEB/YKS) uygunluk, kitap soru tiplerinin kapsanması (birebir kopya değil).
4. **Ajan 4 — Fizik yasaları ve vektörler:** Kuvvet/hız/ivme/alan oklarının yönü, uygulama noktası, gerçek oranlı uzunluğu
   (mg aşağı, N yüzeyden cisme, sürtünme harekete zıt), animasyon davranışlarının fizik yasalarına uygunluğu (korunumlar, g, yalnız elektron hareketi…),
   soru çözümleri ve cevaplarının adım adım doğrulanması.
