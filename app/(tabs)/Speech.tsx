import React from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function SpeechToTextPending() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.panel}>
          <ActivityIndicator size="large" />

          <Text style={styles.title}>Speech-to‑Text not available yet</Text>

          <Text style={styles.message}>
            We can't work on the speech-to-text feature right now — it'll take some
            time. We're prioritizing reliability and accuracy; we'll enable it as
            soon as it's ready.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7FA' },
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  panel: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  title: { marginTop: 18, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { marginTop: 12, fontSize: 14, lineHeight: 20, textAlign: 'center', color: '#444' },
  button: {
    marginTop: 20,
    backgroundColor: '#0B84FF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonText: { color: 'white', fontWeight: '600' },
  footer: { marginTop: 18, fontSize: 12, color: '#666' },
});
