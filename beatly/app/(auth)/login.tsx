import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '@/store/authSlice';
import { AppDispatch, RootState } from '@/store';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Beatly</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
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
              placeholder="••••••••"
              placeholderTextColor="#444"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>SIGN IN</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Beatly? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  headerContainer: { marginBottom: 48 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#666', fontSize: 16, marginTop: 8 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 24 },
  label: { color: '#444', fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  input: { 
    height: 56, backgroundColor: '#0A0A0A', color: '#fff', paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#1A1A1A', fontSize: 16 
  },
  mainButton: { 
    height: 56, backgroundColor: '#fff', borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', marginTop: 12 
  },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  errorText: { color: '#FF453A', marginBottom: 16, fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#666', fontSize: 14 },
  linkText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});