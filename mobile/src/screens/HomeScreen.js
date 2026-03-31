import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Card, Divider, Text } from 'react-native-paper';

import { getDefaultBaseUrl } from '../api/client';
import { listContributions } from '../api/contributions';
import { listLoans } from '../api/loans';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../state/auth';
import { useChama } from '../state/chama';

function MetricCard({ title, value, subtitle, accessibilityLabel }) {
  return (
    <Card accessibilityLabel={accessibilityLabel || title} style={{ flex: 1, borderRadius: 12 }}>
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
  const { selectedChama } = useChama();
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      >
        <GradientHeader height={180}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Overview</Text>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>
            {selectedChama ? selectedChama.name : 'Select a chama'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            {selectedChama ? `Currency: ${selectedChama.currency}` : 'Choose a chama to see contributions, loans, and activity.'}
          </Text>

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ChamasTab', { baseUrl })}
              accessibilityLabel="Open chamas"
            >
              Open chamas
            </Button>
            {selectedChama ? (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('ChamaHome', { chama: selectedChama, baseUrl })}
                accessibilityLabel="View selected chama"
              >
                View
              </Button>
            ) : null}
          </View>
        </GradientHeader>

        <View style={{ padding: 14, marginTop: -34 }}>
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

          <View style={{ marginTop: 18 }}>
            <Text variant="titleMedium" style={{ fontWeight: '900' }}>
              Quick actions
            </Text>
            <Divider style={{ marginTop: 10 }} />

            <View style={{ marginTop: 12, gap: 10 }}>
              <Button
                mode="contained"
                disabled={!selectedChama}
                onPress={() => navigation.navigate('Contributions', { chama: selectedChama, baseUrl })}
                accessibilityLabel="Add contribution"
              >
                Add contribution
              </Button>
              <Button
                mode="contained"
                disabled={!selectedChama}
                onPress={() => navigation.navigate('Loans', { chama: selectedChama, baseUrl })}
                accessibilityLabel="Apply for loan"
              >
                Apply for loan
              </Button>
              <Button
                mode="outlined"
                disabled={!selectedChama}
                onPress={() => navigation.navigate('Chat', { chama: selectedChama, baseUrl })}
                accessibilityLabel="Open group chat"
              >
                Open group chat
              </Button>
              <Button
                mode="text"
                disabled={!selectedChama}
                onPress={() => navigation.navigate('ActivityTab')}
                accessibilityLabel="View activity"
              >
                View activity
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
