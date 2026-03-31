import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { getDefaultBaseUrl } from '../api/client';
import { listMembers } from '../api/chamas';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../state/auth';

export default function ChamaHomeScreen({ navigation, route }) {
  const { chama, baseUrl: baseUrlFromRoute } = route.params;
  const baseUrl = useMemo(() => baseUrlFromRoute || getDefaultBaseUrl(), [baseUrlFromRoute]);
  const { token } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await listMembers({ baseUrl, token, chamaId: chama.id });
        const myId = (() => {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload?.sub;
          } catch (e) {
            return null;
          }
        })();

        const role = Array.isArray(rows) ? rows.find((m) => m.user_id === myId)?.role : null;
        const admin = ['chairperson', 'treasurer', 'secretary'].includes(String(role || '').toLowerCase());
        if (mounted) setIsAdmin(admin);
      } catch (e) {
        if (mounted) setIsAdmin(false);
        Toast.show({ type: 'error', text1: 'Error', text2: e.message });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [chama.id, baseUrl, token]);

  const ActionCard = ({ title, subtitle, onPress }) => (
    <Pressable onPress={onPress} style={{ borderRadius: 12, overflow: 'hidden' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: 'rgba(15,23,42,0.06)',
        }}
      >
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text variant="titleMedium" style={{ fontWeight: '900' }}>
            {title}
          </Text>
          <Text style={{ opacity: 0.65, marginTop: 4 }}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(15,23,42,0.45)" />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={chama.name} />
      </Appbar.Header>

      <GradientHeader height={150}>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Group</Text>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>{chama.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Currency: {chama.currency}</Text>
      </GradientHeader>

      <View style={{ flex: 1, padding: 14, marginTop: 12, gap: 12 }}>
        <Card style={{ borderRadius: 16, backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '900' }}>
              Actions
            </Text>
            <Text style={{ opacity: 0.65, marginTop: 6 }}>Manage the group and open features.</Text>

            <View style={{ marginTop: 12, gap: 10 }}>
              <ActionCard
                title="Contributions"
                subtitle="Track payments and history"
                onPress={() => navigation.navigate('Contributions', { chama, baseUrl })}
              />
              <ActionCard title="Loans" subtitle="Apply, approve and monitor" onPress={() => navigation.navigate('Loans', { chama, baseUrl })} />
              <ActionCard title="Group Chat" subtitle="Announcements and messages" onPress={() => navigation.navigate('Chat', { chama, baseUrl })} />
              {isAdmin ? <ActionCard title="Admin" subtitle="Edit chama and manage members" onPress={() => navigation.navigate('ChamaAdmin', { chama, baseUrl })} /> : null}
            </View>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}
