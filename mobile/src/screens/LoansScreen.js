import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, View } from 'react-native';
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
  const [selectedLoan, setSelectedLoan] = useState(null);

  const fmtMoney = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return String(n ?? '—');
    return chama?.currency ? `${chama.currency} ${x.toLocaleString()}` : x.toLocaleString();
  };

  const fmtDateTime = useMemo(() => {
    return (d) => {
      if (!d) return '—';
      const dt = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(dt.getTime())) return String(d);
      return dt.toLocaleString();
    };
  }, []);

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
              <Pressable onPress={() => setSelectedLoan(item)}>
                <Card style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
                  <Card.Content style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                        {fmtMoney(item.principal_amount)}
                      </Text>
                      <Text style={{ opacity: 0.65 }}>{String(item.status || '').toUpperCase()}</Text>
                    </View>
                    <Text style={{ opacity: 0.7 }}>Term: {item.term_months} months</Text>
                    <Text style={{ opacity: 0.6 }}>Borrower: {item.borrower_full_name || item.borrower_user_id || '—'}</Text>
                  </Card.Content>
                </Card>
              </Pressable>
            </View>
          )}
        />

        <Modal visible={!!selectedLoan} transparent animationType="fade" onRequestClose={() => setSelectedLoan(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(2,6,23,0.55)', padding: 16, justifyContent: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
              <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(15,23,42,0.03)' }}>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontWeight: '900', fontSize: 16 }}>Loan details</Text>
                  <Text style={{ opacity: 0.6 }}>{chama?.name}</Text>
                </View>
                <Pressable onPress={() => setSelectedLoan(null)} accessibilityLabel="Close loan details">
                  <Ionicons name="close" size={22} color="rgba(15,23,42,0.65)" />
                </Pressable>
              </View>

              <View style={{ padding: 14, gap: 10 }}>
                <Card style={{ borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
                  <Card.Content style={{ gap: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ opacity: 0.65 }}>Principal</Text>
                        <Text style={{ fontWeight: '900', fontSize: 18 }}>{fmtMoney(selectedLoan?.principal_amount)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ opacity: 0.65 }}>Status</Text>
                        <Text style={{ fontWeight: '900' }}>{String(selectedLoan?.status || '').toUpperCase() || '—'}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ opacity: 0.65 }}>Borrower</Text>
                        <Text style={{ fontWeight: '800' }}>{selectedLoan?.borrower_full_name || selectedLoan?.borrower_user_id || '—'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ opacity: 0.65 }}>Term</Text>
                        <Text style={{ fontWeight: '800' }}>{selectedLoan?.term_months ? `${selectedLoan.term_months} months` : '—'}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ opacity: 0.65 }}>Interest</Text>
                        <Text style={{ fontWeight: '800' }}>
                          {selectedLoan?.interest_type ? `${selectedLoan.interest_type}` : '—'}
                          {selectedLoan?.interest_rate != null ? ` @ ${selectedLoan.interest_rate}%` : ''}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ opacity: 0.65 }}>Total payable</Text>
                        <Text style={{ fontWeight: '800' }}>{selectedLoan?.total_payable != null ? fmtMoney(selectedLoan.total_payable) : '—'}</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                <Card style={{ borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
                  <Card.Content style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                      <Text style={{ opacity: 0.65 }}>Initiated</Text>
                      <Text style={{ fontWeight: '800' }}>{fmtDateTime(selectedLoan?.created_at)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                      <Text style={{ opacity: 0.65 }}>Last updated</Text>
                      <Text style={{ fontWeight: '800' }}>{fmtDateTime(selectedLoan?.updated_at)}</Text>
                    </View>
                  </Card.Content>
                </Card>

                <Button mode="contained" onPress={() => setSelectedLoan(null)} style={{ borderRadius: 12 }} contentStyle={{ paddingVertical: 6 }}>
                  Close
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
