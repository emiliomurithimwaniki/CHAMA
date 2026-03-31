import React, { useMemo, useState } from 'react';
import { Animated, Easing, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Button, Text, TextInput } from 'react-native-paper';

import { createChama } from '../api/chamas';
import { getDefaultBaseUrl } from '../api/client';
import { useAuth } from '../state/auth';
import { useChama } from '../state/chama';

export default function CreateChamaScreen({ navigation, route }) {
  const baseUrl = useMemo(() => route?.params?.baseUrl || getDefaultBaseUrl(), [route?.params?.baseUrl]);
  const { token } = useAuth();
  const { setSelectedChama } = useChama();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(10)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const onCreate = async () => {
    try {
      setBusy(true);
      const res = await createChama({ baseUrl, token, name });
      setSelectedChama(res);
      Toast.show({ type: 'success', text1: 'Created', text2: 'Chama created successfully' });
      navigation.navigate('HomeTab');
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Create Chama" />
      </Appbar.Header>

      <View style={{ flex: 1, padding: 14 }}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <Text variant="titleMedium" style={{ fontWeight: '700' }}>
            Start a new group
          </Text>
          <Text style={{ opacity: 0.7, marginTop: 6 }}>Give your chama a name. You can invite members later.</Text>

          <View style={{ marginTop: 14, gap: 12 }}>
            <TextInput mode="outlined" label="Chama name" value={name} onChangeText={setName} accessibilityLabel="Chama name" />
            <Button mode="contained" onPress={onCreate} loading={busy} disabled={busy || !name.trim()} contentStyle={{ paddingVertical: 6 }}>
              Create
            </Button>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
