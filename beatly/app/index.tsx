import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient'; // install expo-linear-gradient

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>BEATLY</Text>
        <Text style={styles.tagline}>Music freedom. No borders.</Text>
        
        <View style={styles.features}>
          <Text style={styles.featureText}>• Access to QQ Music & NetEase</Text>
          <Text style={styles.featureText}>• No VPN required for streaming</Text>
          <Text style={styles.featureText}>• Full-stack ASP.NET integration</Text>
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: 5 },
  tagline: { color: '#888', fontSize: 18, marginBottom: 40 },
  features: { marginBottom: 50, width: '100%', paddingLeft: 20 },
  featureText: { color: '#ccc', fontSize: 16, marginVertical: 5, fontWeight: '300' },
  button: { 
    backgroundColor: '#fff', 
    paddingVertical: 18, 
    paddingHorizontal: 60, 
    borderRadius: 30 
  },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 16 }
});