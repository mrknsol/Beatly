import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MiniPlayer } from '@/components/mini-player';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function TabLayout() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <View style={styles.shell}>
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#000' } }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="playlists"
        options={{
          title: 'Playlists',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="music.note.list" color={color} />,
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: isAuthenticated ? '/(tabs)/profile' : '/(auth)/login',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={isAuthenticated ? "person.fill" : "lock.fill"} color={color} />
          ),
        }}
      />

    </Tabs>
    <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#000' },
});