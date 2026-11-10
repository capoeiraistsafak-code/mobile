import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getSubject, type Question } from '../data/questions';
import { useProgress } from '../lib/progress';

type Props = { question: Question; index: number; showSubject?: boolean };

export function QuestionRow({ question, index, showSubject }: Props) {
  const { isCorrect, watched, favorites } = useProgress();
  const result = isCorrect(question.id);
  const subject = getSubject(question.subjectId);

  const badge =
    result === true
      ? { label: 'Doğru', bg: '#D3F9D8', fg: '#2B8A3E' }
      : result === false
        ? { label: 'Yanlış', bg: '#FFE3E3', fg: '#C92A2A' }
        : { label: 'Çözülmedi', bg: '#E9ECEF', fg: '#495057' };

  return (
    <Link href={{ pathname: '/question/[id]', params: { id: question.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={[styles.number, { backgroundColor: subject?.color ?? '#4C6EF5' }]}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.topic}>
            {showSubject && subject ? `${subject.name} · ` : ''}
            {question.topic}
          </Text>
          <Text style={styles.text} numberOfLines={2}>
            {question.text}
          </Text>
          <View style={styles.meta}>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.fg }]}>{badge.label}</Text>
            </View>
            {watched.includes(question.id) && <Text style={styles.metaText}>▶ İzlendi</Text>}
            {favorites.includes(question.id) && <Text style={styles.metaText}>★</Text>}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  pressed: { opacity: 0.7 },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { color: '#fff', fontWeight: '700' },
  body: { flex: 1, gap: 4 },
  topic: { fontSize: 12, color: '#6C757D', fontWeight: '600' },
  text: { fontSize: 15, color: '#1F2A44' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  metaText: { fontSize: 12, color: '#F08C00', fontWeight: '600' },
});
