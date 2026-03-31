import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Card, Text } from 'react-native-paper';

import { listContributions } from '../api/contributions';
import { getDefaultBaseUrl } from '../api/client';
import { listLoans } from '../api/loans';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../state/auth';
import { useChama } from '../state/chama';

function toTs(value) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function formatWhen(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function ActivityCard({ title, subtitle, meta }) {
  return (
    <Card style={{ borderRadius: 12 }} accessibilityLabel={title}>
      <Card.Content>
        <Text style={{ fontWeight: '900' }}>{title}</Text>
        {subtitle ? <Text style={{ opacity: 0.7, marginTop: 4 }}>{subtitle}</Text> : null}
        {meta ? <Text style={{ opacity: 0.55, marginTop: 6 }}>{meta}</Text> : null}
      </Card.Content>
    </Card>
  );
}

export default function ActivityScreen({ navigation }) {
  const baseUrl = useMemo(() => getDefaultBaseUrl(), []);
  const { token } = useAuth();
  const { selectedChama } = useChama();
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState([]);

  const currency = selectedChama?.currency || '';
  const fmtMoney = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return '—';
    return currency ? `${currency} ${x.toLocaleString()}` : x.toLocaleString();
  };

  const load = async () => {
    if (!selectedChama) {
      setEvents([]);
      return;
    }
    try {
      setBusy(true);
      const [contribs, loans] = await Promise.all([
        listContributions({ baseUrl, token, chamaId: selectedChama.id }),
        listLoans({ baseUrl, token, chamaId: selectedChama.id }),
      ]);

      const contribEvents = (Array.isArray(contribs) ? contribs : []).map((c) => ({
        key: `c:${c.id}`,
        ts: toTs(c.contribution_date || c.created_at),
        type: 'contribution',
        title: `Contribution ${fmtMoney(c.amount)}`,
        subtitle: c.status ? `Status: ${c.status}` : null,
        meta: formatWhen(c.contribution_date || c.created_at),
      }));

      const loanEvents = (Array.isArray(loans) ? loans : []).map((l) => ({
        key: `l:${l.id}`,
        ts: toTs(l.created_at || l.updated_at),
        type: 'loan',
        title: `Loan ${fmtMoney(l.principal_amount)}`,
        subtitle: l.status ? `Status: ${l.status}` : null,
        meta: l.term_months ? `Term: ${l.term_months} months` : formatWhen(l.created_at || l.updated_at),
      }));

      const merged = [...contribEvents, ...loanEvents].sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setEvents(merged.slice(0, 30));
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
        <GradientHeader height={170}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Activity</Text>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>
            {selectedChama ? selectedChama.name : 'Select a chama'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            Latest contributions and loans.
          </Text>

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <Button mode="contained" onPress={() => navigation.navigate('ChamasTab')} accessibilityLabel="Switch chama">
              Switch
            </Button>
            <Button mode="outlined" onPress={load} accessibilityLabel="Refresh activity">
              Refresh
            </Button>
          </View>
        </GradientHeader>

        <View style={{ padding: 14, marginTop: -34, gap: 12 }}>
          {!selectedChama ? (
            <ActivityCard title="No chama selected" subtitle="Select a chama to see activity." meta={null} />
          ) : events.length === 0 && !busy ? (
            <ActivityCard title="No activity yet" subtitle="Contributions and loans will appear here." meta={null} />
          ) : (
            events.map((e) => <ActivityCard key={e.key} title={e.title} subtitle={e.subtitle} meta={e.meta} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
