import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchSearch, type SearchArgs } from '@/store/searchSlice';
import { playTrackThunk } from '@/store/playerSlice';
import { Track } from '@/constants/track';
import { IconSymbol } from '@/components/ui/icon-symbol';

function formatArtist(artist: string): string {
  if (!artist) return '';
  const t = artist.trim();
  if (t.startsWith('[')) {
    try {
      const parsed = JSON.parse(t) as unknown;
      return Array.isArray(parsed) ? (parsed as string[]).join(', ') : t;
    } catch {
      return t;
    }
  }
  return t;
}

const SOURCES = ['mix', 'netease', 'tencent', 'kuwo'] as const;
type MusicSource = (typeof SOURCES)[number];

function sourceLabel(s: MusicSource): string {
  if (s === 'mix') return 'Mix';
  return s;
}

export default function SearchTab() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [source, setSource] = useState<MusicSource>('mix');
  const dispatch = useDispatch<AppDispatch>();
  const { tracks, loading, error } = useSelector((state: RootState) => state.search);

  const runSearch = useCallback(
    (args: SearchArgs) => {
      setSubmittedQuery(args.query.trim());
      dispatch(fetchSearch(args));
    },
    [dispatch]
  );

  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    if (source === 'mix') runSearch({ query: q, merge: true });
    else runSearch({ query: q, source });
  }, [query, source, runSearch]);

  const pickSource = useCallback(
    (s: MusicSource) => {
      setSource(s);
      const q = query.trim() || submittedQuery.trim();
      if (q) {
        if (s === 'mix') runSearch({ query: q, merge: true });
        else runSearch({ query: q, source: s });
      }
    },
    [query, submittedQuery, runSearch]
  );

  const renderTrack = ({ item }: { item: Track }) => (
    <TouchableOpacity
      style={styles.trackCard}
      activeOpacity={0.85}
      onPress={() => dispatch(playTrackThunk(item))}>
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <IconSymbol name="music.note.list" size={24} color="#666" />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {formatArtist(item.artist)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const listEmpty =
    !loading && submittedQuery ? (
      <View style={styles.emptyWrap}>
        {error ? (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.emptyHint}>
              Run beatly.API (port 5289) and metly-proxy (port 3000). On Android emulator set
              EXPO_PUBLIC_API_URL=http://10.0.2.2:5289/api
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>
            No tracks found — try Mix (all sources) or switch to Tencent / Kuwo.
          </Text>
        )}
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      <View style={styles.sourceRow}>
        {SOURCES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => pickSource(s)}
            style={[styles.chip, source === s && styles.chipActive]}
            accessibilityLabel={`Source ${s}`}>
            <Text style={[styles.chipText, source === s && styles.chipTextActive]}>{sourceLabel(s)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchBar}
          placeholder="Song or artist"
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} accessibilityLabel="Search">
          <IconSymbol name="magnifyingglass" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item, index) =>
            `${item.source || 'x'}-${item.externalId || index}`
          }
          renderItem={renderTrack}
          contentContainerStyle={{ paddingBottom: 180, paddingHorizontal: 16 }}
          ListEmptyComponent={listEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  header: { color: '#fff', fontSize: 28, fontWeight: '800', marginHorizontal: 16, marginBottom: 10 },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  chipText: { color: '#888', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  chipTextActive: { color: '#000' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    height: 45,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
  },
  searchButton: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cover: { width: 55, height: 55, borderRadius: 4 },
  coverPlaceholder: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: { marginLeft: 12, flex: 1 },
  trackTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  trackArtist: { color: '#888', fontSize: 14, marginTop: 2 },
  emptyWrap: { paddingTop: 40, paddingHorizontal: 8 },
  emptyText: { color: '#666', textAlign: 'center', fontSize: 16 },
  errorText: { color: '#FF453A', textAlign: 'center', fontSize: 15, marginBottom: 12 },
  emptyHint: { color: '#444', textAlign: 'center', fontSize: 13, lineHeight: 20 },
});