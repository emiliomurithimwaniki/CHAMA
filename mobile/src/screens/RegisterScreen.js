import React, { useMemo, useState } from 'react';
import { Animated, Easing, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Text, TextInput } from 'react-native-paper';

import { register } from '../api/auth';
import { getDefaultBaseUrl } from '../api/client';

export default function RegisterScreen({ navigation }) {
  const baseUrl = useMemo(() => getDefaultBaseUrl(), []);
  const [fullName, setFullName] = useState('');
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

  const onRegister = async () => {
    try {
      setBusy(true);
      await register({ baseUrl, full_name: fullName, phone_number: phone, password });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Account created. Now login.' });
      navigation.navigate('Login');
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Register failed', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 18, justifyContent: 'center' }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text variant="headlineMedium" style={{ fontWeight: '800' }}>
            Create account
          </Text>
          <Text variant="titleSmall" style={{ opacity: 0.7, marginTop: 6 }}>
            Join your chama in minutes
          </Text>
        </Animated.View>

        <Animated.View style={{ marginTop: 18, gap: 12, opacity: fade, transform: [{ translateY: slide }] }}>
          <TextInput
            mode="outlined"
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            accessibilityLabel="Full name"
          />
          <TextInput
            mode="outlined"
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="07..."
            accessibilityLabel="Phone number"
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Password"
          />

          <Button mode="contained" onPress={onRegister} loading={busy} disabled={busy} contentStyle={{ paddingVertical: 6 }}>
            Create
          </Button>
          <Button mode="text" onPress={() => navigation.goBack()}>
            Back to login
          </Button>

          <Text variant="labelSmall" style={{ opacity: 0.5, marginTop: 6 }}>
            API: {baseUrl}
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
