import React, { useMemo, useState } from 'react';
import { Animated, Easing, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Text, TextInput } from 'react-native-paper';

import { login } from '../api/auth';
import { getDefaultBaseUrl } from '../api/client';
import { useAuth } from '../state/auth';

export default function LoginScreen({ navigation }) {
  const { setToken } = useAuth();
  const baseUrl = useMemo(() => getDefaultBaseUrl(), []);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(12)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const onLogin = async () => {
    try {
      setBusy(true);
      const res = await login({ baseUrl, phone_number: phone, password });
      await setToken(res.access_token);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 18, justifyContent: 'center' }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text variant="headlineLarge" style={{ fontWeight: '800' }}>
            Chama
          </Text>
          <Text variant="titleMedium" style={{ opacity: 0.7, marginTop: 6 }}>
            Sign in to continue
          </Text>
        </Animated.View>

        <Animated.View style={{ marginTop: 18, gap: 12, opacity: fade, transform: [{ translateY: slide }] }}>
          <TextInput
            mode="outlined"
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="07..."
            accessibilityLabel="Phone number"
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Password"
          />

          <Button mode="contained" onPress={onLogin} loading={busy} disabled={busy} contentStyle={{ paddingVertical: 6 }}>
            Sign In
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('Register')}>
            Create account
          </Button>

          <Text variant="labelSmall" style={{ opacity: 0.5, marginTop: 6 }}>
            API: {baseUrl}
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
