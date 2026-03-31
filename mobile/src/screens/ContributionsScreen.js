import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';

import { addContribution, listContributions } from '../api/contributions';
import { useAuth } from '../state/auth';

export default function ContributionsScreen({ route }) {
  const { chama, baseUrl } = route.params;
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setBusy(true);
      const res = await listContributions({ baseUrl, token, chamaId: chama.id });
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

  const onAdd = async () => {
    try {
      setBusy(true);
      await addContribution({ baseUrl, token, chamaId: chama.id, amount });
      setAmount('');
      await load();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Contributions" />
      </Appbar.Header>

      <View style={{ flex: 1, padding: 14, gap: 12 }}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              Add contribution
            </Text>
            <View style={{ marginTop: 10, gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                accessibilityLabel="Contribution amount"
              />
              <Button mode="contained" onPress={onAdd} loading={busy} disabled={busy || !amount.trim()}>
                Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          refreshing={busy}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <View style={{ marginTop: 10 }}>
              <Card>
                <Card.Content>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    {item.amount}
                  </Text>
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.contribution_date}</Text>
                  <Text style={{ opacity: 0.5, marginTop: 2 }}>{item.status}</Text>
                </Card.Content>
              </Card>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
