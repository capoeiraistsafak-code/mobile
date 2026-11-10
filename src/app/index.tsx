import { Link } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getQuestionsBySubject, QUESTIONS, SECTIONS, SUBJECTS } from '../data/questions';
import { useProgress } from '../lib/progress';

export default function HomeScreen() {
  const { answers, isCorrect, favorites, reset } = useProgress();

  const solved = QUESTIONS.filter((q) => answers[q.id]).length;
  const correct = QUESTIONS.filter((q) => isCorrect(q.id)).length;

  const confirmReset = () =>
    Alert.alert('İlerlemeyi sıfırla', 'Tüm cevaplar, izlenen videolar ve favoriler silinsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sıfırla', style: 'destructive', onPress: reset },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Soru çöz, çözümü izle</Text>
        <Text style={styles.heroText}>
          {solved}/{QUESTIONS.length} soru çözüldü · {correct} doğru
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(solved / QUESTIONS.length) * 100}%` }]} />
        </View>
      </View>

      <Link href="/favorites" asChild>
        <Pressable style={({ pressed }) => [styles.favorites, pressed && styles.pressed]}>
          <Text style={styles.favoritesText}>★ Favori sorularım ({favorites.length})</Text>
        </Pressable>
      </Link>

      {SECTIONS.map((section) => (
        <View key={section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section}</Text>
          <View style={styles.grid}>
            {SUBJECTS.filter((s) => s.section === section).map((subject) => {
              const qs = getQuestionsBySubject(subject.id);
              const done = qs.filter((q) => answers[q.id]).length;
              return (
                <Link
                  key={subject.id}
                  href={{ pathname: '/subject/[id]', params: { id: subject.id } }}
                  asChild
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.card,
                      { borderLeftColor: subject.color },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.cardIcon}>{subject.icon}</Text>
                    <Text style={styles.cardTitle}>{subject.name}</Text>
                    <Text style={styles.cardMeta}>
                      {done}/{qs.length} soru
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </View>
      ))}

      <Pressable onPress={confirmReset} style={styles.reset}>
        <Text style={styles.resetText}>İlerlemeyi sıfırla</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  hero: { backgroundColor: '#1F2A44', borderRadius: 18, padding: 20, gap: 6 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroText: { color: '#C5CEE0', fontSize: 14 },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#51CF66' },
  favorites: {
    marginTop: 12,
    backgroundColor: '#FFF3BF',
    padding: 14,
    borderRadius: 14,
  },
  favoritesText: { color: '#8F5B00', fontWeight: '700', fontSize: 15 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1F2A44', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 5,
    gap: 2,
  },
  pressed: { opacity: 0.7 },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2A44' },
  cardMeta: { fontSize: 13, color: '#6C757D' },
  reset: { marginTop: 28, alignItems: 'center', padding: 10 },
  resetText: { color: '#C92A2A', fontWeight: '600' },
});
