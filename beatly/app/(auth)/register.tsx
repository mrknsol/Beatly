import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { registerUser } from '@/store/authSlice';

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) return;
    const result = await dispatch(registerUser({ username, email, password }));
    if (registerUser.fulfilled.match(result)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Join Beatly</Text>
          <Text style={styles.subtitle}>Your music experience starts here</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="luffy_pirate"
              placeholderTextColor="#444"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              placeholderTextColor="#444"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              placeholderTextColor="#444"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { padding: 24, paddingTop: 60 },
  backButton: { marginBottom: 32 },
  backButtonText: { color: '#666', fontSize: 16 },
  headerContainer: { marginBottom: 40 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#666', fontSize: 16, marginTop: 8 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  label: { color: '#444', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  input: { 
    height: 56, backgroundColor: '#0A0A0A', color: '#fff', paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#1A1A1A' 
  },
  mainButton: { height: 56, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  errorText: { color: '#FF453A', marginBottom: 16 },
});