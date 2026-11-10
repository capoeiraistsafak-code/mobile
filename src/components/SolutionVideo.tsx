import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  uri: string;
  onStarted?: () => void;
};

export function SolutionVideo({ uri, onStarted }: Props) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (isPlaying) onStarted?.();
  }, [isPlaying, onStarted]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
      />
      {status === 'loading' && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color="#fff" />
        </View>
      )}
      {status === 'error' && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.error}>Video yüklenemedi. İnternet bağlantınızı kontrol edin.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  error: { color: '#fff', textAlign: 'center' },
});
