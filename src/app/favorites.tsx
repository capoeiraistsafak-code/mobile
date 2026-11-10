import { FlatList, StyleSheet, Text } from 'react-native';

import { QuestionRow } from '../components/QuestionRow';
import { QUESTIONS } from '../data/questions';
import { useProgress } from '../lib/progress';

export default function FavoritesScreen() {
  const { favorites } = useProgress();
  const questions = QUESTIONS.filter((q) => favorites.includes(q.id));

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={questions}
      keyExtractor={(q) => q.id}
      renderItem={({ item, index }) => <QuestionRow question={item} index={index} showSubject />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Henüz favori sorunuz yok. Soru ekranındaki ☆ simgesiyle soru ekleyebilirsiniz.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  empty: { textAlign: 'center', color: '#6C757D', marginTop: 40, paddingHorizontal: 24 },
});
