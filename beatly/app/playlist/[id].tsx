import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LIKED_SONGS_ID } from '@/constants/playlist';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const playlist = useSelector((state: RootState) =>
    state.playlists.items.find((p) => p.id === id)
  );

  const isLiked = id === LIKED_SONGS_ID || playlist?.kind === 'liked';

  const header = useMemo(() => {
    if (!playlist) {
      return (
        <View style={[styles.missing, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backRow}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <IconSymbol name="chevron.left" size={28} color="#fff" />
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.missingTitle}>Playlist not found</Text>
        </View>
      );
    }

    if (isLiked) {
      return (
        <LinearGradient
          colors={['#2d1b69', '#5b21b6', '#9d174d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.likedHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backRow}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <IconSymbol name="chevron.left" size={28} color="#fff" />
            <Text style={styles.backOnGradient}>Back</Text>
          </TouchableOpacity>
          <View style={styles.heroIconCircle}>
            <IconSymbol name="heart.fill" size={44} color="#fff" />
          </View>
          <Text style={styles.likedTitle}>{playlist.title}</Text>
          <Text style={styles.likedMeta}>Playlist · You</Text>
          <Text style={styles.likedCount}>
            {playlist.trackCount === 0
              ? 'No songs yet'
              : `${playlist.trackCount} song${playlist.trackCount === 1 ? '' : 's'}`}
          </Text>
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.plainHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backRow}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <IconSymbol name="chevron.left" size={28} color="#fff" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <View style={styles.plainCover}>
          <IconSymbol name="music.note.list" size={40} color="#bbb" />
        </View>
        <Text style={styles.plainTitle}>{playlist.title}</Text>
        <Text style={styles.plainMeta}>{playlist.trackCount} songs</Text>
      </View>
    );
  }, [playlist, isLiked, insets.top, router]);

  if (!playlist) {
    return <View style={styles.screen}>{header}</View>;
  }

  return (
    <View style={styles.screen}>
      {header}
      <View style={styles.listContent}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySubtitle}>
            {isLiked
              ? 'Like songs from Search and they will show up here.'
              : 'Add tracks to this playlist to see them here.'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
  backOnGradient: { color: 'rgba(255,255,255,0.95)', fontSize: 17, fontWeight: '600' },
  likedHeader: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  likedTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  likedMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginTop: 8,
    fontWeight: '600',
  },
  likedCount: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    marginTop: 6,
  },
  plainHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  plainCover: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  plainTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  plainMeta: { color: '#666', fontSize: 14, marginTop: 6 },
  listContent: { paddingHorizontal: 20, paddingTop: 24, flexGrow: 1 },
  empty: { paddingVertical: 32, alignItems: 'center' },
  emptyTitle: { color: '#888', fontSize: 18, fontWeight: '700' },
  emptySubtitle: {
    color: '#555',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 300,
  },
  missing: { flex: 1, paddingHorizontal: 20 },
  missingTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 40 },
});
