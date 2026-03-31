import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';

import { addMember, listMembers, removeMember, setMemberRole, updateChama } from '../api/chamas';
import { getDefaultBaseUrl } from '../api/client';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../state/auth';
import { useChama } from '../state/chama';

const ADMIN_ROLES = new Set(['chairperson', 'treasurer', 'secretary']);
const VALID_ROLES = ['member', 'chairperson', 'treasurer', 'secretary'];

const ROLE_LABELS = {
  member: 'Member',
  chairperson: 'Chairperson',
  treasurer: 'Treasurer',
  secretary: 'Secretary',
};

function RolePill({ role }) {
  const isAdmin = ADMIN_ROLES.has(String(role || '').toLowerCase());
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: isAdmin ? 'rgba(37,99,235,0.12)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <Text style={{ fontWeight: '800', color: isAdmin ? '#2563eb' : 'rgba(0,0,0,0.7)' }}>{String(role || 'member')}</Text>
    </View>
  );
}

export default function ChamaAdminScreen({ navigation, route }) {
  const baseUrl = useMemo(() => route?.params?.baseUrl || getDefaultBaseUrl(), [route?.params?.baseUrl]);
  const { token } = useAuth();
  const { selectedChama, setSelectedChama } = useChama();

  const chamaFromRoute = route?.params?.chama || null;
  const chama = selectedChama || chamaFromRoute;

  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState([]);

  const [name, setName] = useState(chama?.name || '');
  const [currency, setCurrency] = useState(chama?.currency || '');

  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('member');

  useEffect(() => {
    if (chamaFromRoute && (!selectedChama || selectedChama.id !== chamaFromRoute.id)) {
      setSelectedChama(chamaFromRoute);
    }
  }, [chamaFromRoute?.id]);

  useEffect(() => {
    setName(chama?.name || '');
    setCurrency(chama?.currency || '');
  }, [chama?.id]);

  const load = async () => {
    if (!chama) {
      setMembers([]);
      return;
    }
    try {
      setBusy(true);
      const res = await listMembers({ baseUrl, token, chamaId: chama.id });
      setMembers(Array.isArray(res) ? res : []);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message || 'Failed to load members' });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [chama?.id]);

  const onSaveChama = async () => {
    if (!chama) return;
    try {
      setBusy(true);
      const res = await updateChama({ baseUrl, token, chamaId: chama.id, name: name.trim(), currency: currency.trim() });
      setSelectedChama(res);
      Toast.show({ type: 'success', text1: 'Saved', text2: 'Chama updated' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  const onAddMember = async () => {
    if (!chama) return;
    try {
      setBusy(true);
      await addMember({ baseUrl, token, chamaId: chama.id, phone_number: phone.trim(), role });
      setPhone('');
      setRole('member');
      Toast.show({ type: 'success', text1: 'Added', text2: 'Member added' });
      await load();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  const onChangeRole = async (userId, nextRole) => {
    if (!chama) return;
    try {
      setBusy(true);
      await setMemberRole({ baseUrl, token, chamaId: chama.id, userId, role: nextRole });
      Toast.show({ type: 'success', text1: 'Updated', text2: 'Role updated' });
      await load();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (userId) => {
    if (!chama) return;
    try {
      setBusy(true);
      await removeMember({ baseUrl, token, chamaId: chama.id, userId });
      Toast.show({ type: 'success', text1: 'Removed', text2: 'Member removed' });
      await load();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={busy} onRefresh={load} />}
      >
        <GradientHeader height={170}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Admin</Text>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>
            {chama ? chama.name : 'No chama selected'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Edit chama info and manage members.</Text>

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <Button mode="contained" onPress={() => navigation.goBack()} accessibilityLabel="Go back">
              Back
            </Button>
            <Button mode="outlined" onPress={load} accessibilityLabel="Refresh">
              Refresh
            </Button>
          </View>
        </GradientHeader>

        <View style={{ padding: 14, marginTop: 12, gap: 12 }}>
          {!chama ? (
            <Card style={{ borderRadius: 12 }}>
              <Card.Content>
                <Text style={{ fontWeight: '900' }}>Select a chama</Text>
                <Text style={{ opacity: 0.7, marginTop: 6 }}>Go to Home or Profile and select a chama first.</Text>
              </Card.Content>
            </Card>
          ) : (
            <>
              <Card style={{ borderRadius: 12 }}>
                <Card.Content>
                  <Text style={{ fontWeight: '900' }}>Chama information</Text>
                  <View style={{ marginTop: 10, gap: 10 }}>
                    <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} accessibilityLabel="Chama name" />
                    <TextInput mode="outlined" label="Currency" value={currency} onChangeText={setCurrency} accessibilityLabel="Chama currency" />
                    <Button mode="contained" onPress={onSaveChama} disabled={busy || !name.trim()} accessibilityLabel="Save chama">
                      Save
                    </Button>
                  </View>
                </Card.Content>
              </Card>

              <Card style={{ borderRadius: 12 }}>
                <Card.Content>
                  <Text style={{ fontWeight: '900' }}>Add member</Text>
                  <Text style={{ opacity: 0.7, marginTop: 6 }}>Add by phone number (must be registered).</Text>

                  <View style={{ marginTop: 10, gap: 10 }}>
                    <TextInput
                      mode="outlined"
                      label="Phone number"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      accessibilityLabel="Member phone number"
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {VALID_ROLES.map((r) => (
                        <Button
                          key={r}
                          mode={role === r ? 'contained' : 'outlined'}
                          onPress={() => setRole(r)}
                          style={{ flex: 1 }}
                          accessibilityLabel={`Set role ${r}`}
                        >
                          {ROLE_LABELS[r] || r}
                        </Button>
                      ))}
                    </View>

                    <Button mode="contained" onPress={onAddMember} disabled={busy || !phone.trim()} accessibilityLabel="Add member">
                      Add member
                    </Button>
                  </View>
                </Card.Content>
              </Card>

              <Card style={{ borderRadius: 12 }}>
                <Card.Content>
                  <Text style={{ fontWeight: '900' }}>Members</Text>
                  <Text style={{ opacity: 0.7, marginTop: 6 }}>Tap a role to change it. Remove will delete membership.</Text>

                  <View style={{ marginTop: 10 }}>
                    {members.length === 0 && !busy ? (
                      <Text style={{ opacity: 0.7 }}>No members found.</Text>
                    ) : null}

                    {members.map((m, idx) => (
                      <View key={m.user_id} style={{ paddingVertical: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '900' }}>{m.full_name || m.phone_number || m.user_id}</Text>
                            <Text style={{ opacity: 0.65, marginTop: 2 }}>
                              {m.full_name ? (m.phone_number ? m.phone_number : m.user_id) : m.join_status}
                            </Text>
                          </View>
                          <RolePill role={m.role} />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          {VALID_ROLES.map((r) => (
                            <Button
                              key={`${m.user_id}:${r}`}
                              mode={String(m.role) === r ? 'contained' : 'outlined'}
                              onPress={() => onChangeRole(m.user_id, r)}
                              disabled={busy}
                              accessibilityLabel={`Change role to ${r} for user ${m.user_id}`}
                            >
                              {r}
                            </Button>
                          ))}

                          <Button
                            mode="text"
                            onPress={() => onRemove(m.user_id)}
                            disabled={busy}
                            accessibilityLabel={`Remove member ${m.user_id}`}
                          >
                            Remove
                          </Button>
                        </View>

                        {idx !== members.length - 1 ? <Divider style={{ marginTop: 12 }} /> : null}
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
