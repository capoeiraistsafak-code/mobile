# TYT Soru Video

TYT sorularını çözüp her sorunun **çözüm videosunu** izleyebileceğiniz Expo (React Native) mobil uygulaması.

## Özellikler

- TYT bölümlerine göre dersler: Türkçe, Temel Matematik, Fen (Fizik, Kimya, Biyoloji), Sosyal (Tarih, Coğrafya, Felsefe)
- Soru ekranı: şık seçme, cevabı kontrol etme, yazılı çözüm
- Her soru için uygulama içi çözüm videosu (`expo-video`, tam ekran ve resim içinde resim destekli)
- İlerleme takibi (çözülen / doğru / izlenen) ve favori sorular — cihazda saklanır (AsyncStorage)
- Ders içinde önceki / sonraki soruya geçiş

## Çalıştırma

```bash
npm install
npx expo start
```

`expo-video` yerel kod içerdiğinden en sağlıklı sonuç için bir geliştirme derlemesi kullanın:
`npx expo run:android` / `npx expo run:ios` veya `npx eas-cli@latest build --profile development`.

## Soru ve video ekleme

Tüm içerik `src/data/questions.ts` dosyasındadır. Yeni soru eklemek için `QUESTIONS` dizisine bir kayıt ekleyin:

```ts
{
  id: 'mat-5',
  subjectId: 'matematik',
  topic: 'Oran-Orantı',
  text: 'Soru metni…',
  options: { A: '…', B: '…', C: '…', D: '…', E: '…' },
  answer: 'B',
  explanation: 'Kısa çözüm…',
  videoUrl: 'https://…/cozum.mp4', // mp4 veya HLS (.m3u8)
}
```

> Not: Örnek sorulardaki `videoUrl` alanları şimdilik **yer tutucu** bir örnek videoya işaret ediyor. Kendi çözüm videolarınızı yükleyip adresleri değiştirin.

## Proje yapısı

```
src/
  app/                 Expo Router ekranları
    _layout.tsx        Stack navigasyon + ilerleme sağlayıcısı
    index.tsx          Ana sayfa (dersler, genel ilerleme)
    subject/[id].tsx   Dersin soru listesi
    question/[id].tsx  Soru, cevap kontrolü ve çözüm videosu
    favorites.tsx      Favori sorular
  components/          SolutionVideo, QuestionRow
  data/questions.ts    Dersler ve sorular
  lib/progress.tsx     İlerleme/favori durumu (AsyncStorage)
```

## Kontroller

```bash
npm run typecheck
```

## TYT videoları

Video formatları ve üretim dosyaları `tyt/` klasöründe (bkz. `tyt/README.md`, `tyt/FORMAT.md`).
