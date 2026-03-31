import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Button, Card, Text } from 'react-native-paper';

import { getDefaultBaseUrl } from '../api/client';
import { listChamas } from '../api/chamas';
import { useAuth } from '../state/auth';
import { useChama } from '../state/chama';

export default function ChamasScreen({ navigation }) {
  const baseUrl = useMemo(() => getDefaultBaseUrl(), []);
  const { token, setToken } = useAuth();
  const { setSelectedChama } = useChama();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setBusy(true);
      const res = await listChamas({ baseUrl, token });
      setItems(res);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="My Chamas" />
        <Button mode="text" onPress={load} disabled={busy} accessibilityLabel="Refresh chamas">
          Refresh
        </Button>
        <Button mode="text" onPress={() => setToken(null)} accessibilityLabel="Log out">
          Logout
        </Button>
      </Appbar.Header>

      <View style={{ flex: 1, padding: 14 }}>
        {items.length === 0 && !busy ? (
          <View style={{ padding: 16 }}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              No chamas yet
            </Text>
            <Text style={{ opacity: 0.7, marginTop: 6 }}>Create one to get started.</Text>
            <Button style={{ marginTop: 12 }} mode="contained" onPress={() => navigation.navigate('AddTab', { baseUrl })}>
              Create chama
            </Button>
          </View>
        ) : null}

        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          refreshing={busy}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <View style={{ marginBottom: 12 }}>
              <Card
                onPress={() => {
                  setSelectedChama(item);
                  navigation.navigate('HomeTab');
                }}
              >
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    {item.name}
                  </Text>
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.currency}</Text>
                </Card.Content>
              </Card>
            </View>
          )}
        />

        <View style={{ position: 'absolute', right: 16, bottom: 16 }}>
          <Button mode="contained" onPress={() => navigation.navigate('AddTab', { baseUrl })} accessibilityLabel="Create chama">
            + Create
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
