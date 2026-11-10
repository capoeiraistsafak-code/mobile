import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SolutionVideo } from '../../components/SolutionVideo';
import {
  getQuestion,
  getQuestionsBySubject,
  getSubject,
  OPTION_KEYS,
  type OptionKey,
} from '../../data/questions';
import { useProgress } from '../../lib/progress';

export default function QuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = getQuestion(id);
  const { answers, answer, favorites, toggleFavorite, markWatched } = useProgress();

  const previous = question ? answers[question.id] : undefined;
  const [selected, setSelected] = useState<OptionKey | undefined>(previous);
  const [checked, setChecked] = useState(previous !== undefined);
  const [showVideo, setShowVideo] = useState(false);

  const onVideoStarted = useCallback(() => {
    if (question) markWatched(question.id);
  }, [question, markWatched]);

  if (!question) {
    return (
      <View style={styles.center}>
        <Text>Soru bulunamadı.</Text>
      </View>
    );
  }

  const subject = getSubject(question.subjectId);
  const siblings = getQuestionsBySubject(question.subjectId);
  const position = siblings.findIndex((q) => q.id === question.id);
  const prev = siblings[position - 1];
  const next = siblings[position + 1];
  const isFavorite = favorites.includes(question.id);
  const color = subject?.color ?? '#4C6EF5';

  const check = () => {
    if (!selected) return;
    answer(question.id, selected);
    setChecked(true);
  };

  const retry = () => {
    setSelected(undefined);
    setChecked(false);
  };

  const goTo = (questionId: string) =>
    router.replace({ pathname: '/question/[id]', params: { id: questionId } });

  return (
    <>
      <Stack.Screen
        options={{
          title: `${subject?.name ?? 'Soru'} · ${position + 1}/${siblings.length}`,
          headerRight: () => (
            <Pressable onPress={() => toggleFavorite(question.id)} hitSlop={12}>
              <Text style={styles.star}>{isFavorite ? '★' : '☆'}</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.topic, { color }]}>{question.topic}</Text>
        <Text style={styles.question}>{question.text}</Text>

        <View style={styles.options}>
          {OPTION_KEYS.map((key) => {
            const isSelected = selected === key;
            const isAnswer = question.answer === key;
            let state: 'idle' | 'selected' | 'correct' | 'wrong' = isSelected ? 'selected' : 'idle';
            if (checked) {
              if (isAnswer) state = 'correct';
              else if (isSelected) state = 'wrong';
            }
            return (
              <Pressable
                key={key}
                disabled={checked}
                onPress={() => setSelected(key)}
                style={[
                  styles.option,
                  state === 'selected' && { borderColor: color, backgroundColor: '#EDF2FF' },
                  state === 'correct' && styles.optionCorrect,
                  state === 'wrong' && styles.optionWrong,
                ]}
              >
                <View
                  style={[
                    styles.optionKey,
                    state === 'selected' && { backgroundColor: color },
                    state === 'correct' && { backgroundColor: '#2B8A3E' },
                    state === 'wrong' && { backgroundColor: '#C92A2A' },
                  ]}
                >
                  <Text style={[styles.optionKeyText, state !== 'idle' && { color: '#fff' }]}>
                    {key}
                  </Text>
                </View>
                <Text style={styles.optionText}>{question.options[key]}</Text>
              </Pressable>
            );
          })}
        </View>

        {!checked ? (
          <Pressable
            onPress={check}
            disabled={!selected}
            style={[styles.primary, { backgroundColor: color }, !selected && styles.disabled]}
          >
            <Text style={styles.primaryText}>Cevabı kontrol et</Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.result,
              selected === question.answer ? styles.resultCorrect : styles.resultWrong,
            ]}
          >
            <Text style={styles.resultTitle}>
              {selected === question.answer
                ? '✅ Doğru cevap!'
                : `❌ Yanlış. Doğru cevap: ${question.answer}`}
            </Text>
            <Text style={styles.explanation}>{question.explanation}</Text>
            <Pressable onPress={retry}>
              <Text style={styles.link}>Tekrar dene</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.videoSection}>
          <Text style={styles.videoTitle}>🎬 Çözüm videosu</Text>
          {showVideo ? (
            <SolutionVideo uri={question.videoUrl} onStarted={onVideoStarted} />
          ) : (
            <Pressable
              onPress={() => setShowVideo(true)}
              style={[styles.videoPlaceholder, { backgroundColor: color }]}
            >
              <Text style={styles.play}>▶</Text>
              <Text style={styles.videoHint}>
                {checked ? 'Çözümü izle' : 'Önce kendin dene, sonra çözümü izle'}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.nav}>
          <Pressable
            disabled={!prev}
            onPress={() => prev && goTo(prev.id)}
            style={[styles.navButton, !prev && styles.disabled]}
          >
            <Text style={styles.navText}>‹ Önceki</Text>
          </Pressable>
          <Pressable
            disabled={!next}
            onPress={() => next && goTo(next.id)}
            style={[styles.navButton, !next && styles.disabled]}
          >
            <Text style={styles.navText}>Sonraki ›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: 16, paddingBottom: 40, gap: 14 },
  star: { fontSize: 24, color: '#F08C00' },
  topic: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  question: { fontSize: 18, lineHeight: 26, color: '#1F2A44', fontWeight: '600' },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCorrect: { borderColor: '#2B8A3E', backgroundColor: '#EBFBEE' },
  optionWrong: { borderColor: '#C92A2A', backgroundColor: '#FFF5F5' },
  optionKey: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionKeyText: { fontWeight: '700', color: '#495057' },
  optionText: { flex: 1, fontSize: 15, color: '#1F2A44' },
  primary: { padding: 16, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.4 },
  result: { padding: 14, borderRadius: 14, gap: 6 },
  resultCorrect: { backgroundColor: '#D3F9D8' },
  resultWrong: { backgroundColor: '#FFE3E3' },
  resultTitle: { fontWeight: '800', fontSize: 16, color: '#1F2A44' },
  explanation: { fontSize: 15, lineHeight: 22, color: '#343A40' },
  link: { color: '#364FC7', fontWeight: '700', marginTop: 4 },
  videoSection: { gap: 8 },
  videoTitle: { fontSize: 17, fontWeight: '800', color: '#1F2A44' },
  videoPlaceholder: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  play: { fontSize: 44, color: '#fff' },
  videoHint: { color: '#fff', fontWeight: '600' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  navButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navText: { fontWeight: '700', color: '#1F2A44' },
});
