import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';

import { applyLoan, listLoans } from '../api/loans';
import { useAuth } from '../state/auth';

export default function LoansScreen({ route }) {
  const { chama, baseUrl } = route.params;
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setBusy(true);
      const res = await listLoans({ baseUrl, token, chamaId: chama.id });
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

  const onApply = async () => {
    try {
      setBusy(true);
      await applyLoan({ baseUrl, token, chamaId: chama.id, principal_amount: amount, term_months: 1 });
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
        <Appbar.Content title="Loans" />
      </Appbar.Header>

      <View style={{ flex: 1, padding: 14, gap: 12 }}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              Apply for a loan
            </Text>
            <View style={{ marginTop: 10, gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                accessibilityLabel="Loan amount"
              />
              <Button mode="contained" onPress={onApply} loading={busy} disabled={busy || !amount.trim()}>
                Apply
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
                    {item.principal_amount}
                  </Text>
                  <Text style={{ opacity: 0.7, marginTop: 4 }}>Term: {item.term_months} months</Text>
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
