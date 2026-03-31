import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { addContribution, listContributions } from '../api/contributions';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../state/auth';

export default function ContributionsScreen({ navigation, route }) {
  const { chama, baseUrl } = route.params;
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTx, setActiveTx] = useState(null);

  const fmtMoney = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return String(n ?? '—');
    return chama?.currency ? `${chama.currency} ${x.toLocaleString()}` : x.toLocaleString();
  };

  const filtered = items.filter((i) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const hay = `${i?.amount ?? ''} ${i?.contribution_date ?? ''} ${i?.status ?? ''}`.toLowerCase();
    return hay.includes(q);
  });

  const formatWhen = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleString();
    } catch (e) {
      return String(value);
    }
  };

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
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Contributions" subtitle={chama?.name} />
        <Appbar.Action
          icon={() => <Ionicons name="search-outline" size={20} />}
          onPress={() => setShowSearch((s) => !s)}
          accessibilityLabel="Search contributions"
        />
      </Appbar.Header>

      <GradientHeader height={140}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Contributions</Text>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>{chama?.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Add a contribution and view payment history.</Text>
      </GradientHeader>

      <View style={{ flex: 1, padding: 14, marginTop: 12, gap: 12 }}>
        <Card style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                Add contribution
              </Text>
              <Ionicons name="add-circle-outline" size={18} color="rgba(15,23,42,0.55)" />
            </View>
            <View style={{ marginTop: 10, gap: 10 }}>
              <TextInput
                mode="outlined"
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                accessibilityLabel="Contribution amount"
              />
              <Button mode="contained" onPress={onAdd} loading={busy} disabled={busy || !amount.trim()} style={{ borderRadius: 12 }} contentStyle={{ paddingVertical: 6 }}>
                Add
              </Button>
            </View>
          </Card.Content>
        </Card>

        {showSearch ? (
          <Card style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
            <Card.Content>
              <TextInput
                mode="outlined"
                label="Search"
                value={query}
                onChangeText={setQuery}
                placeholder="Amount, date, status..."
                accessibilityLabel="Search contributions"
                left={<TextInput.Icon icon={() => <Ionicons name="search-outline" size={18} />} />}
              />
            </Card.Content>
          </Card>
        ) : null}

        <Card
          style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}
          onPress={() => setShowHistory((s) => !s)}
          accessibilityLabel="Transaction history"
        >
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="receipt-outline" size={18} color="rgba(15,23,42,0.55)" />
                <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                  Transaction history
                </Text>
              </View>
              <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={18} color="rgba(15,23,42,0.45)" />
            </View>
            <Text style={{ opacity: 0.65, marginTop: 6 }}>
              {filtered.length} record{filtered.length === 1 ? '' : 's'}
            </Text>
          </Card.Content>
        </Card>

        {showHistory ? (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            refreshing={busy}
            onRefresh={load}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item, index }) => (
              <View style={{ marginTop: 10 }}>
                <Card
                  style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}
                  onPress={() => setActiveTx(item)}
                  accessibilityLabel={`Transaction ${item.id}`}
                >
                  <Card.Content style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                        {fmtMoney(item.amount)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="rgba(15,23,42,0.45)" />
                        <Text style={{ opacity: 0.65 }}>{String(item.status || '').toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={{ opacity: 0.7 }}>{item.contribution_date}</Text>
                  </Card.Content>
                </Card>
              </View>
            )}
          />
        ) : null}

        <Modal
          visible={!!activeTx}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveTx(null)}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', padding: 16, justifyContent: 'center' }} onPress={() => setActiveTx(null)}>
            <Pressable onPress={() => {}} style={{ width: '100%' }}>
              <Card style={{ borderRadius: 18, backgroundColor: '#ffffff' }}>
                <Card.Content style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                      Transaction details
                    </Text>
                    <Ionicons name="close" size={20} color="rgba(15,23,42,0.55)" onPress={() => setActiveTx(null)} />
                  </View>

                  <View style={{ gap: 6 }}>
                    <Text style={{ opacity: 0.65 }}>Amount</Text>
                    <Text variant="titleLarge" style={{ fontWeight: '900' }}>
                      {activeTx ? fmtMoney(activeTx.amount) : '—'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Status</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? String(activeTx.status || '—').toUpperCase() : '—'}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Contribution date</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? String(activeTx.contribution_date || '—') : '—'}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Initiated by</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? activeTx.user_full_name || activeTx.user_id || '—' : '—'}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Recorded by</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? activeTx.recorded_by_full_name || activeTx.recorded_by_user_id || '—' : '—'}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Payment method</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? activeTx.payment_method || '—' : '—'}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Reference</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? activeTx.payment_reference || '—' : '—'}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Created at</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? formatWhen(activeTx.created_at) : '—'}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ opacity: 0.65 }}>Period</Text>
                      <Text style={{ fontWeight: '800' }}>{activeTx ? activeTx.period_key || '—' : '—'}</Text>
                    </View>
                  </View>

                  <Button mode="contained" onPress={() => setActiveTx(null)} style={{ borderRadius: 12 }} contentStyle={{ paddingVertical: 6 }}>
                    Done
                  </Button>
                </Card.Content>
              </Card>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
