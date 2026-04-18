import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { stopPlaybackThunk, togglePauseThunk } from '@/store/playerSlice';
import { IconSymbol } from '@/components/ui/icon-symbol';

function formatTime(ms: number) {
  if (!ms || ms < 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const TAB_BAR_OFFSET = 52;

export function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTrack, phase, isPlaying, positionMillis, durationMillis, error } = useSelector(
    (s: RootState) => s.player
  );

  if (!currentTrack) return null;

  const bottom = TAB_BAR_OFFSET + Math.max(insets.bottom, 6);
  const busy = phase === 'loading';
  const failed = phase === 'error';

  return (
    <View style={[styles.wrap, { bottom }]}>
      <View style={styles.row}>
        {currentTrack.coverUrl ? (
          <Image source={{ uri: currentTrack.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPh]}>
            <IconSymbol name="music.note.list" size={20} color="#666" />
          </View>
        )}
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={[styles.sub, failed && styles.subError]} numberOfLines={2}>
            {failed && error ? error : `${formatTime(positionMillis)} / ${formatTime(durationMillis)}`}
          </Text>
        </View>
        {busy ? (
          <ActivityIndicator color="#fff" style={styles.spin} />
        ) : failed ? null : (
          <TouchableOpacity
            onPress={() => dispatch(togglePauseThunk())}
            style={styles.iconBtn}
            hitSlop={10}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
            <IconSymbol name={isPlaying ? 'pause.fill' : 'play.fill'} size={30} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => dispatch(stopPlaybackThunk())}
          style={styles.iconBtn}
          hitSlop={10}
          accessibilityLabel="Stop">
          <IconSymbol name="xmark.circle.fill" size={26} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  cover: { width: 44, height: 44, borderRadius: 6 },
  coverPh: { backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, marginLeft: 10, marginRight: 6 },
  title: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sub: { color: '#888', fontSize: 12, marginTop: 2 },
  subError: { color: '#c44' },
  iconBtn: { padding: 4, marginLeft: 4 },
  spin: { marginHorizontal: 12 },
});
