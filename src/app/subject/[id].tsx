import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';

import { QuestionRow } from '../../components/QuestionRow';
import { getQuestionsBySubject, getSubject } from '../../data/questions';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const subject = getSubject(id);
  const questions = getQuestionsBySubject(id);

  return (
    <>
      <Stack.Screen options={{ title: subject ? `${subject.icon} ${subject.name}` : 'Sorular' }} />
      <FlatList
        contentContainerStyle={styles.container}
        data={questions}
        keyExtractor={(q) => q.id}
        renderItem={({ item, index }) => <QuestionRow question={item} index={index} />}
        ListEmptyComponent={<Text style={styles.empty}>Bu derste henüz soru yok.</Text>}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  empty: { textAlign: 'center', color: '#6C757D', marginTop: 40 },
});
