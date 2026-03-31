import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { applyLoan, listLoans } from '../api/loans';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../state/auth';

export default function LoansScreen({ navigation, route }) {
  const { chama, baseUrl } = route.params;
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const fmtMoney = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return String(n ?? '—');
    return chama?.currency ? `${chama.currency} ${x.toLocaleString()}` : x.toLocaleString();
  };

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
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Loans" subtitle={chama?.name} />
      </Appbar.Header>

      <GradientHeader height={140}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Loans</Text>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>{chama?.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Apply for a loan and track your requests.</Text>
      </GradientHeader>

      <View style={{ flex: 1, padding: 14, marginTop: 12, gap: 12 }}>
        <Card style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                Apply for a loan
              </Text>
              <Ionicons name="cash-outline" size={18} color="rgba(15,23,42,0.55)" />
            </View>
            <View style={{ marginTop: 10, gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                accessibilityLabel="Loan amount"
              />
              <Button mode="contained" onPress={onApply} loading={busy} disabled={busy || !amount.trim()} style={{ borderRadius: 12 }} contentStyle={{ paddingVertical: 6 }}>
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
              <Card style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
                <Card.Content style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                      {fmtMoney(item.principal_amount)}
                    </Text>
                    <Text style={{ opacity: 0.65 }}>{String(item.status || '').toUpperCase()}</Text>
                  </View>
                  <Text style={{ opacity: 0.7 }}>Term: {item.term_months} months</Text>
                </Card.Content>
              </Card>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
