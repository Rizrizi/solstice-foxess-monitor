import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius } from '../theme';
import { fetchRealtime } from '../lib/foxess';

export default function ConnectPanel({ onConnected }) {
  const [apiKey, setApiKey] = useState('');
  const [sn, setSn] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  async function handleConnect() {
    if (!apiKey.trim() || !sn.trim()) {
      setIsError(true);
      setMessage('Enter both your OpenAPI key and inverter serial number.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const reading = await fetchRealtime({ apiKey: apiKey.trim(), sn: sn.trim() });
      setIsError(false);
      setMessage('Connected — showing live readings.');
      onConnected && onConnected({ apiKey: apiKey.trim(), sn: sn.trim(), reading });
    } catch (e) {
      setIsError(true);
      setMessage(e.message || 'Could not reach FoxESS. Check your key, serial number, and connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Connect your FoxESS account</Text>
      <Text style={styles.sub}>Switch from demo to live data</Text>

      <TextInput
        style={styles.input}
        placeholder="OpenAPI key"
        placeholderTextColor={colors.inkFaint}
        value={apiKey}
        onChangeText={setApiKey}
        autoCapitalize="none"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Inverter serial number"
        placeholderTextColor={colors.inkFaint}
        value={sn}
        onChangeText={setSn}
        autoCapitalize="characters"
      />

      <Pressable style={styles.button} onPress={handleConnect} disabled={loading}>
        {loading ? <ActivityIndicator color="#231502" /> : <Text style={styles.buttonText}>Connect</Text>}
      </Pressable>

      {message ? (
        <Text style={[styles.message, isError ? styles.messageErr : styles.messageOk]}>{message}</Text>
      ) : null}

      <Text style={styles.note}>
        Your key and serial number stay on this device and are sent straight to FoxESS's servers,
        signed per their OpenAPI spec — no third-party backend involved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line,
    borderRadius: radius.lg, padding: 16,
  },
  title: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: colors.ink },
  sub: { fontSize: 11, color: colors.inkFaint, marginTop: 2, marginBottom: 14 },
  input: {
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.line,
    color: colors.ink, fontSize: 12.5, padding: 10, borderRadius: 9, marginBottom: 9,
  },
  button: {
    backgroundColor: colors.solar, borderRadius: 9, paddingVertical: 10, alignItems: 'center', marginTop: 2,
  },
  buttonText: { color: '#231502', fontWeight: '700', fontSize: 12.5 },
  message: { fontSize: 11.5, marginTop: 10, padding: 9, borderRadius: 9, lineHeight: 16 },
  messageErr: { backgroundColor: '#3A1E1E', color: '#FFB4B4' },
  messageOk: { backgroundColor: '#1B3A2E', color: '#9CEFCB' },
  note: { fontSize: 11, color: colors.inkFaint, marginTop: 10, lineHeight: 16 },
});
