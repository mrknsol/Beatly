import React from 'react';
import { StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { logout } from '@/store/authSlice';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const playlistCount = useSelector((state: RootState) => state.playlists.items.length);

  const onLogOut = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      
      dispatch(logout());
      
      Toast.show({
        type: 'success',
        text1: 'Logged out',
        text2: 'See you soon!'
      });
      
      router.replace('/(auth)/login');
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error logging out' });
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.screen}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
               <IconSymbol size={80} name="person.fill" color="#fff" />
            </View>
            <ThemedText type="title" style={styles.userName}>
              {user?.username || 'Pirate'}
            </ThemedText>
            <ThemedText style={styles.userEmail}>
              {user?.email || 'no-email@beatly.app'}
            </ThemedText>
          </View>

          <View style={styles.statsContainer}>
             <View style={styles.statBox}>
                <ThemedText style={styles.statNumber}>{playlistCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Playlists</ThemedText>
             </View>
             <View style={[styles.statBox, styles.statBorder]}>
                <ThemedText style={styles.statNumber}>0</ThemedText>
                <ThemedText style={styles.statLabel}>Following</ThemedText>
             </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton}>
              <ThemedText style={styles.secondaryButtonText}>Edit Profile</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buttonExit}
              onPress={onLogOut}
            >
              <ThemedText style={styles.exitText}>Log Out</ThemedText>
            </TouchableOpacity>
          </View>

        </View>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, paddingHorizontal: 25, justifyContent: 'space-around' },
  header: { alignItems: 'center', marginTop: 40 },
  avatarContainer: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333'
  },
  userName: { marginTop: 20, fontSize: 28, color: '#fff', fontWeight: '800' },
  userEmail: { marginTop: 5, fontSize: 16, color: '#666' },
  
  statsContainer: { 
    flexDirection: 'row', backgroundColor: '#0A0A0A', borderRadius: 20, 
    padding: 20, borderWidth: 1, borderColor: '#1A1A1A' 
  },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: '#222' },
  statNumber: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 4, textTransform: 'uppercase' },

  actions: { gap: 15 },
  secondaryButton: {
    height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center'
  },
  secondaryButtonText: { color: '#fff', fontWeight: '600' },
  buttonExit: {
    height: 55, borderRadius: 15, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center'
  },
  exitText: { color: '#FF3B30', fontWeight: '700' },
});