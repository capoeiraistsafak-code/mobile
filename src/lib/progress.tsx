import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getQuestion, type OptionKey } from '../data/questions';

const STORAGE_KEY = 'tyt-soru-video/progress/v1';

type StoredProgress = {
  /** Soru id → kullanıcının son verdiği cevap. */
  answers: Record<string, OptionKey>;
  /** Çözüm videosu izlenen sorular. */
  watched: string[];
  /** Favorilere eklenen sorular. */
  favorites: string[];
};

const EMPTY: StoredProgress = { answers: {}, watched: [], favorites: [] };

type ProgressContextValue = StoredProgress & {
  loaded: boolean;
  answer: (questionId: string, option: OptionKey) => void;
  markWatched: (questionId: string) => void;
  toggleFavorite: (questionId: string) => void;
  isCorrect: (questionId: string) => boolean | undefined;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredProgress>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as Partial<StoredProgress>) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const answer = useCallback((questionId: string, option: OptionKey) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: option } }));
  }, []);

  const markWatched = useCallback((questionId: string) => {
    setState((s) => (s.watched.includes(questionId) ? s : { ...s, watched: [...s.watched, questionId] }));
  }, []);

  const toggleFavorite = useCallback((questionId: string) => {
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(questionId)
        ? s.favorites.filter((id) => id !== questionId)
        : [...s.favorites, questionId],
    }));
  }, []);

  const isCorrect = useCallback(
    (questionId: string) => {
      const given = state.answers[questionId];
      if (!given) return undefined;
      return getQuestion(questionId)?.answer === given;
    },
    [state.answers],
  );

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo(
    () => ({ ...state, loaded, answer, markWatched, toggleFavorite, isCorrect, reset }),
    [state, loaded, answer, markWatched, toggleFavorite, isCorrect, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
