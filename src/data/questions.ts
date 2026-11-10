export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];

export type Question = {
  id: string;
  subjectId: string;
  topic: string;
  text: string;
  options: Record<OptionKey, string>;
  answer: OptionKey;
  /** Kısa yazılı çözüm. */
  explanation: string;
  /** Çözüm videosunun adresi (mp4 / HLS). */
  videoUrl: string;
};

export type Subject = {
  id: string;
  name: string;
  section: Section;
  color: string;
  icon: string;
};

export type Section = 'Türkçe' | 'Temel Matematik' | 'Fen Bilimleri' | 'Sosyal Bilimler';

export const SECTIONS: Section[] = ['Türkçe', 'Temel Matematik', 'Fen Bilimleri', 'Sosyal Bilimler'];

/**
 * Yer tutucu çözüm videosu. Kendi çözüm videolarınızı yükledikten sonra her
 * sorunun `videoUrl` alanını gerçek adresle değiştirin.
 */
const PLACEHOLDER_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const SUBJECTS: Subject[] = [
  { id: 'turkce', name: 'Türkçe', section: 'Türkçe', color: '#E85D75', icon: '📖' },
  { id: 'matematik', name: 'Matematik', section: 'Temel Matematik', color: '#4C6EF5', icon: '➗' },
  { id: 'fizik', name: 'Fizik', section: 'Fen Bilimleri', color: '#F59F00', icon: '⚡' },
  { id: 'kimya', name: 'Kimya', section: 'Fen Bilimleri', color: '#12B886', icon: '⚗️' },
  { id: 'biyoloji', name: 'Biyoloji', section: 'Fen Bilimleri', color: '#40C057', icon: '🧬' },
  { id: 'tarih', name: 'Tarih', section: 'Sosyal Bilimler', color: '#A0522D', icon: '🏛️' },
  { id: 'cografya', name: 'Coğrafya', section: 'Sosyal Bilimler', color: '#15AABF', icon: '🌍' },
  { id: 'felsefe', name: 'Felsefe', section: 'Sosyal Bilimler', color: '#7950F2', icon: '💭' },
];

export const QUESTIONS: Question[] = [
  // Türkçe
  {
    id: 'tr-1',
    subjectId: 'turkce',
    topic: 'Yazım Kuralları',
    text: 'Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?',
    options: {
      A: 'Herkes bu konuda hemfikirdi.',
      B: 'Yarın ki toplantıya katılamayacağım.',
      C: 'Her şey yolunda gidiyor.',
      D: 'Bu sabah erkenden yola çıktık.',
      E: 'Hiçbir şey söylemeden gitti.',
    },
    answer: 'B',
    explanation:
      'Sıfat yapan "-ki" eki kelimeye bitişik yazılır: "yarınki". Diğer cümlelerde yazım doğrudur.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'tr-2',
    subjectId: 'turkce',
    topic: 'Sözcükte Anlam',
    text: '"Göz ardı etmek" deyiminin anlamı aşağıdakilerden hangisidir?',
    options: {
      A: 'Dikkatle incelemek',
      B: 'Gizlice izlemek',
      C: 'Önemsememek, dikkate almamak',
      D: 'Çok beğenmek',
      E: 'Kıskanmak',
    },
    answer: 'C',
    explanation: '"Göz ardı etmek", bir şeyi önemsememek ya da hesaba katmamak anlamındadır.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'tr-3',
    subjectId: 'turkce',
    topic: 'Sözcük Yapısı',
    text: 'Aşağıdakilerden hangisi birleşik sözcüktür?',
    options: { A: 'Kitaplık', B: 'Gözlük', C: 'Yolcu', D: 'Hanımeli', E: 'Sevgi' },
    answer: 'D',
    explanation:
      '"Hanımeli" iki ayrı sözcüğün (hanım + eli) birleşip yeni bir anlam (bir bitki) kazanmasıyla oluşmuştur. Diğerleri yapım ekiyle türemiştir.',
    videoUrl: PLACEHOLDER_VIDEO,
  },

  // Matematik
  {
    id: 'mat-1',
    subjectId: 'matematik',
    topic: 'Üslü Sayılar',
    text: '2³ + 3² − 4 işleminin sonucu kaçtır?',
    options: { A: '11', B: '12', C: '13', D: '14', E: '15' },
    answer: 'C',
    explanation: '2³ = 8 ve 3² = 9 olduğundan 8 + 9 − 4 = 13 bulunur.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'mat-2',
    subjectId: 'matematik',
    topic: 'Denklemler',
    text: 'Bir sayının 3 katının 5 fazlası 26 ise bu sayı kaçtır?',
    options: { A: '6', B: '7', C: '8', D: '9', E: '10' },
    answer: 'B',
    explanation: '3x + 5 = 26 → 3x = 21 → x = 7.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'mat-3',
    subjectId: 'matematik',
    topic: 'Yaş Problemleri',
    text: 'Ali 12, babası 40 yaşındadır. Kaç yıl sonra babasının yaşı Ali’nin yaşının 2 katı olur?',
    options: { A: '10', B: '12', C: '14', D: '16', E: '18' },
    answer: 'D',
    explanation: '40 + x = 2(12 + x) → 40 + x = 24 + 2x → x = 16.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'mat-4',
    subjectId: 'matematik',
    topic: 'Yüzde Problemleri',
    text: 'Bir malın fiyatı önce %20 artırılıp sonra %20 indirilirse son fiyat ilk fiyata göre nasıl değişir?',
    options: {
      A: 'Değişmez',
      B: '%4 artar',
      C: '%4 azalır',
      D: '%2 azalır',
      E: '%20 azalır',
    },
    answer: 'C',
    explanation: 'İlk fiyat 100 olsun: 100 → 120 → 120 × 0,8 = 96. Fiyat %4 azalmıştır.',
    videoUrl: PLACEHOLDER_VIDEO,
  },

  // Fizik
  {
    id: 'fiz-1',
    subjectId: 'fizik',
    topic: 'Newton’un Hareket Yasaları',
    text: '2 kg kütleli bir cisme 10 N büyüklüğünde net kuvvet etki ediyor. Cismin ivmesi kaç m/s²’dir?',
    options: { A: '0,2', B: '2', C: '5', D: '10', E: '20' },
    answer: 'C',
    explanation: 'F = m · a → 10 = 2 · a → a = 5 m/s².',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'fiz-2',
    subjectId: 'fizik',
    topic: 'Birim Dönüşümü',
    text: '72 km/h hız kaç m/s’dir?',
    options: { A: '7,2', B: '10', C: '20', D: '36', E: '72' },
    answer: 'C',
    explanation: 'km/h’yi m/s’ye çevirmek için 3,6’ya bölünür: 72 / 3,6 = 20 m/s.',
    videoUrl: PLACEHOLDER_VIDEO,
  },

  // Kimya
  {
    id: 'kim-1',
    subjectId: 'kimya',
    topic: 'Madde ve Özellikleri',
    text: 'Aşağıdakilerden hangisi bir elementtir?',
    options: { A: 'Su', B: 'Sofra tuzu', C: 'Hava', D: 'Demir', E: 'Şeker' },
    answer: 'D',
    explanation:
      'Demir (Fe) tek tür atomdan oluşan bir elementtir. Su, tuz ve şeker bileşik; hava ise karışımdır.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'kim-2',
    subjectId: 'kimya',
    topic: 'Asitler ve Bazlar',
    text: '25 °C’de pH değeri 3 olan bir sulu çözelti için aşağıdakilerden hangisi doğrudur?',
    options: { A: 'Baziktir', B: 'Nötrdür', C: 'Asidiktir', D: 'Tuz çözeltisidir', E: 'Belirlenemez' },
    answer: 'C',
    explanation: '25 °C’de pH < 7 olan çözeltiler asidiktir.',
    videoUrl: PLACEHOLDER_VIDEO,
  },

  // Biyoloji
  {
    id: 'bio-1',
    subjectId: 'biyoloji',
    topic: 'Hücre',
    text: 'Bitki hücrelerinde fotosentez hangi organelde gerçekleşir?',
    options: { A: 'Kloroplast', B: 'Mitokondri', C: 'Ribozom', D: 'Lizozom', E: 'Golgi cisimciği' },
    answer: 'A',
    explanation: 'Fotosentez, klorofil pigmenti içeren kloroplastlarda gerçekleşir.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'bio-2',
    subjectId: 'biyoloji',
    topic: 'Nükleik Asitler',
    text: 'Aşağıdaki organik bazlardan hangisi DNA’nın yapısında bulunmaz?',
    options: { A: 'Adenin', B: 'Guanin', C: 'Sitozin', D: 'Timin', E: 'Urasil' },
    answer: 'E',
    explanation: 'Urasil yalnızca RNA’da bulunur; DNA’da onun yerine timin vardır.',
    videoUrl: PLACEHOLDER_VIDEO,
  },

  // Tarih
  {
    id: 'tar-1',
    subjectId: 'tarih',
    topic: 'Türk-İslam Devletleri',
    text: 'Anadolu’nun kapılarını Türklere açan Malazgirt Savaşı hangi yılda yapılmıştır?',
    options: { A: '1040', B: '1071', C: '1176', D: '1243', E: '1453' },
    answer: 'B',
    explanation: 'Malazgirt Savaşı 1071’de Büyük Selçuklu Devleti ile Bizans arasında yapılmıştır.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'tar-2',
    subjectId: 'tarih',
    topic: 'Kurtuluş Savaşı',
    text: 'Türkiye Büyük Millet Meclisi hangi tarihte açılmıştır?',
    options: {
      A: '19 Mayıs 1919',
      B: '30 Ağustos 1922',
      C: '23 Nisan 1920',
      D: '29 Ekim 1923',
      E: '3 Mart 1924',
    },
    answer: 'C',
    explanation: 'TBMM 23 Nisan 1920’de Ankara’da açılmıştır.',
    videoUrl: PLACEHOLDER_VIDEO,
  },

  // Coğrafya
  {
    id: 'cog-1',
    subjectId: 'cografya',
    topic: 'Türkiye’nin Akarsuları',
    text: 'Kaynağını ve döküldüğü yeri Türkiye sınırları içinde bulunduran en uzun akarsu hangisidir?',
    options: { A: 'Fırat', B: 'Dicle', C: 'Sakarya', D: 'Kızılırmak', E: 'Yeşilırmak' },
    answer: 'D',
    explanation:
      'Kızılırmak, tamamı Türkiye sınırları içinde akan en uzun akarsudur. Fırat ve Dicle ülke dışına çıkar.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'cog-2',
    subjectId: 'cografya',
    topic: 'Harita Bilgisi',
    text: '1/100.000 ölçekli bir haritada 5 cm olarak gösterilen uzaklık gerçekte kaç km’dir?',
    options: { A: '0,5', B: '5', C: '50', D: '500', E: '1' },
    answer: 'B',
    explanation: '5 cm × 100.000 = 500.000 cm = 5 km.',
    videoUrl: PLACEHOLDER_VIDEO,
  },

  // Felsefe
  {
    id: 'fel-1',
    subjectId: 'felsefe',
    topic: 'Felsefenin Alanı',
    text: '"Bildiğim tek şey, hiçbir şey bilmediğimdir." sözü hangi filozofa aittir?',
    options: { A: 'Platon', B: 'Aristoteles', C: 'Sokrates', D: 'Descartes', E: 'Kant' },
    answer: 'C',
    explanation: 'Bu söz, bilgeliğin bilgisizliğin farkına varmakla başladığını savunan Sokrates’e aittir.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
  {
    id: 'fel-2',
    subjectId: 'felsefe',
    topic: 'Bilgi Felsefesi',
    text: 'Bilginin kaynağını, imkânını ve sınırlarını inceleyen felsefe dalı hangisidir?',
    options: { A: 'Ontoloji', B: 'Etik', C: 'Estetik', D: 'Epistemoloji', E: 'Mantık' },
    answer: 'D',
    explanation: 'Bilgi felsefesine epistemoloji denir.',
    videoUrl: PLACEHOLDER_VIDEO,
  },
];

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsBySubject(subjectId: string): Question[] {
  return QUESTIONS.filter((q) => q.subjectId === subjectId);
}
