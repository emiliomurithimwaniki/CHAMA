import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Card, Divider, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { getDefaultBaseUrl } from '../api/client';
import { listContributions } from '../api/contributions';
import { listLoans } from '../api/loans';
import { listChamas } from '../api/chamas';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../state/auth';
import { useChama } from '../state/chama';

function MetricCard({ title, value, subtitle, accessibilityLabel }) {
  return (
    <Card
      accessibilityLabel={accessibilityLabel || title}
      style={{ flex: 1, borderRadius: 14, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}
    >
      <Card.Content>
        <Text variant="labelLarge" style={{ opacity: 0.7 }}>
          {title}
        </Text>
        <Text variant="headlineSmall" style={{ fontWeight: '800', marginTop: 6 }}>
          {value}
        </Text>
        {subtitle ? <Text style={{ opacity: 0.6, marginTop: 2 }}>{subtitle}</Text> : null}
      </Card.Content>
    </Card>
  );
}

export default function HomeScreen({ navigation, route }) {
  const baseUrl = useMemo(() => getDefaultBaseUrl(), []);
  const { selectedChama, chamas, setChamas, ensureDefaultSelected } = useChama();
  const { token } = useAuth();

  const [busy, setBusy] = useState(false);
  const [contribTotal, setContribTotal] = useState(null);
  const [loansActive, setLoansActive] = useState(null);
  const [loansOutstanding, setLoansOutstanding] = useState(null);

  const currency = selectedChama?.currency || '';

  const safeNumber = (n) => {
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
  };

  const fmtMoney = (n) => {
    if (n === null || n === undefined) return '—';
    const x = safeNumber(n);
    return currency ? `${currency} ${x.toLocaleString()}` : x.toLocaleString();
  };

  const load = async () => {
    if (!selectedChama) {
      setContribTotal(null);
      setLoansActive(null);
      setLoansOutstanding(null);
      return;
    }

    try {
      setBusy(true);
      const [contribs, loans] = await Promise.all([
        listContributions({ baseUrl, token, chamaId: selectedChama.id }),
        listLoans({ baseUrl, token, chamaId: selectedChama.id }),
      ]);

      const contribSum = Array.isArray(contribs) ? contribs.reduce((acc, c) => acc + safeNumber(c?.amount), 0) : 0;
      const loansArr = Array.isArray(loans) ? loans : [];
      const active = loansArr.filter((l) => String(l?.status || '').toLowerCase() === 'active').length;
      const outstanding = loansArr
        .filter((l) => String(l?.status || '').toLowerCase() !== 'paid')
        .reduce((acc, l) => acc + safeNumber(l?.principal_amount), 0);

      setContribTotal(contribSum);
      setLoansActive(active);
      setLoansOutstanding(outstanding);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedChama?.id]);

  useEffect(() => {
    ensureDefaultSelected();
  }, [ensureDefaultSelected, chamas?.length, selectedChama?.id]);

  useEffect(() => {
    if (selectedChama) return;
    if (Array.isArray(chamas) && chamas.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await listChamas({ baseUrl, token });
        if (!cancelled) setChamas(res);
      } catch (e) {
        if (!cancelled) Toast.show({ type: 'error', text1: 'Error', text2: e.message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [baseUrl, token, selectedChama, chamas?.length, setChamas]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      >
        <GradientHeader height={180}>
          <View style={{ position: 'absolute', right: 12, top: 22 }}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ChamasTab', { baseUrl })}
              accessibilityLabel="Open chamas"
              icon={() => <Ionicons name="people-outline" size={18} color="white" />}
              contentStyle={{ paddingHorizontal: 6 }}
              style={{ borderRadius: 12 }}
            >
              Chamas
            </Button>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Overview</Text>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>
            {selectedChama ? selectedChama.name : 'Dashboard'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            {selectedChama ? `Currency: ${selectedChama.currency}` : 'Pick a chama to see contributions, loans, and activity.'}
          </Text>
        </GradientHeader>

        <View style={{ padding: 14, marginTop: 12 }}>
          {!selectedChama ? (
            <Card style={{ borderRadius: 14, marginBottom: 12 }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="sparkles-outline" size={18} />
                  <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                    Select your chama
                  </Text>
                </View>
                <Text style={{ opacity: 0.7, marginTop: 8 }}>
                  Your dashboard will show totals and activity once a chama is selected.
                </Text>
                <Button style={{ marginTop: 12, borderRadius: 12 }} mode="contained" onPress={() => navigation.navigate('ChamasTab', { baseUrl })}>
                  Choose chama
                </Button>
              </Card.Content>
            </Card>
          ) : null}

          <Card style={{ borderRadius: 16, paddingVertical: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <MetricCard
                  title="Contributions"
                  value={selectedChama ? fmtMoney(contribTotal) : '—'}
                  subtitle="Total"
                  accessibilityLabel="Total contributions"
                />
                <MetricCard
                  title="Loans"
                  value={selectedChama ? String(loansActive ?? '—') : '—'}
                  subtitle="Active"
                  accessibilityLabel="Active loans"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <MetricCard
                  title="Outstanding"
                  value={selectedChama ? fmtMoney(loansOutstanding) : '—'}
                  subtitle="Not paid"
                  accessibilityLabel="Outstanding loan principal"
                />
                <MetricCard title="Members" value={selectedChama ? '—' : '—'} subtitle="In group" accessibilityLabel="Members" />
              </View>
            </Card.Content>
          </Card>

          <Card
            style={{
              borderRadius: 16,
              marginTop: 16,
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: 'rgba(15,23,42,0.06)',
            }}
          >
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                  Quick actions
                </Text>
                <Ionicons name="flash-outline" size={18} color="rgba(15,23,42,0.65)" />
              </View>
              <Divider style={{ marginTop: 10 }} />

              <View style={{ marginTop: 12, gap: 10 }}>
                <Button
                  mode="contained"
                  disabled={!selectedChama}
                  onPress={() => navigation.navigate('Contributions', { chama: selectedChama, baseUrl })}
                  accessibilityLabel="Add contribution"
                  icon={() => <Ionicons name="add-circle-outline" size={18} color="white" />}
                  contentStyle={{ paddingVertical: 6 }}
                  style={{ borderRadius: 12 }}
                >
                  Add contribution
                </Button>
                <Button
                  mode="contained"
                  disabled={!selectedChama}
                  onPress={() => navigation.navigate('Loans', { chama: selectedChama, baseUrl })}
                  accessibilityLabel="Apply for loan"
                  icon={() => <Ionicons name="cash-outline" size={18} color="white" />}
                  contentStyle={{ paddingVertical: 6 }}
                  style={{ borderRadius: 12 }}
                >
                  Apply for loan
                </Button>
                <Button
                  mode="outlined"
                  disabled={!selectedChama}
                  onPress={() => navigation.navigate('Chat', { chama: selectedChama, baseUrl })}
                  accessibilityLabel="Open group chat"
                  icon={() => <Ionicons name="chatbubbles-outline" size={18} />}
                  contentStyle={{ paddingVertical: 6 }}
                  style={{ borderRadius: 12 }}
                >
                  Open group chat
                </Button>
                <Button
                  mode="text"
                  disabled={!selectedChama}
                  onPress={() => navigation.navigate('ActivityTab')}
                  accessibilityLabel="View activity"
                  icon={() => <Ionicons name="pulse-outline" size={18} />}
                >
                  View activity
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
