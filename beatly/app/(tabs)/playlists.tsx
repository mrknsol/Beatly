import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Playlist } from '@/constants/playlist';

function LikedSongsCard({ item, onPress }: { item: Playlist; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.heroWrap} onPress={onPress}>
      <LinearGradient
        colors={['#2d1b69', '#5b21b6', '#9d174d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}>
        <View style={styles.heroIconCircle}>
          <IconSymbol name="heart.fill" size={36} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroMeta}>Playlist · You</Text>
        <Text style={styles.heroCount}>
          {item.trackCount === 0
            ? 'Songs you like will appear here'
            : `${item.trackCount} song${item.trackCount === 1 ? '' : 's'}`}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function CustomPlaylistRow({ item, onPress }: { item: Playlist; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.rowCover}>
        <IconSymbol name="music.note.list" size={26} color="#bbb" />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowMeta}>Playlist · {item.trackCount} songs</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, loading } = useSelector((state: RootState) => state.playlists);

  const openPlaylist = (id: string) => {
    router.push(`/playlist/${id}`);
  };

  const renderItem = ({ item }: { item: Playlist }) =>
    item.kind === 'liked' ? (
      <LikedSongsCard item={item} onPress={() => openPlaylist(item.id)} />
    ) : (
      <CustomPlaylistRow item={item} onPress={() => openPlaylist(item.id)} />
    );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.pageTitle}>Playlists</Text>
      <Text style={styles.pageSubtitle}>Your library</Text>

      {loading ? (
        <ActivityIndicator color="#fff" style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: '#666',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 22,
  },
  loader: { marginTop: 40 },
  list: { paddingBottom: 120, gap: 14 },
  heroWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 6,
  },
  heroGradient: {
    paddingVertical: 28,
    paddingHorizontal: 22,
    minHeight: 168,
    justifyContent: 'flex-end',
  },
  heroIconCircle: {
    position: 'absolute',
    top: 22,
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  heroCount: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  rowCover: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { marginLeft: 14, flex: 1 },
  rowTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowMeta: { color: '#666', fontSize: 13, marginTop: 3 },
});
