import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Card, Divider, Text } from 'react-native-paper';

import { useAuth } from '../state/auth';
import { useChama } from '../state/chama';
import GradientHeader from '../components/GradientHeader';

function Row({ title, subtitle, onPress }) {
  return (
    <Button
      mode="text"
      onPress={onPress}
      accessibilityLabel={title}
      contentStyle={{ justifyContent: 'flex-start', paddingVertical: 10 }}
      labelStyle={{ textAlign: 'left' }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700' }}>{title}</Text>
        {subtitle ? <Text style={{ opacity: 0.6, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
    </Button>
  );
}

export default function ProfileScreen({ navigation }) {
  const { setToken } = useAuth();
  const { selectedChama, clearSelectedChama } = useChama();

  const initials = useMemo(() => 'U', []);

  const copyText = async (label, value) => {
    try {
      const text = String(value || '');
      const Clipboard = require('react-native').Clipboard;
      if (!Clipboard?.setString) {
        Toast.show({ type: 'error', text1: 'Not supported', text2: 'Copy is not available on this build' });
        return;
      }
      Clipboard.setString(text);
      Toast.show({ type: 'success', text1: 'Copied', text2: `${label} copied to clipboard` });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <GradientHeader height={170}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '800' }}>Profile</Text>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 22, marginTop: 4 }}>Account & settings</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            Manage your details, switch chamas, and review quick actions.
          </Text>
        </GradientHeader>

        <View style={{ padding: 14, marginTop: -34, gap: 12 }}>
          <Card style={{ borderRadius: 12 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'rgba(37,99,235,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="headlineSmall" style={{ fontWeight: '900', color: '#2563eb' }}>
                    {initials}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                    User
                  </Text>
                  <Text style={{ opacity: 0.65, marginTop: 2 }}>@member</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button mode="contained" onPress={() => navigation.navigate('EditProfile')} style={{ flex: 1 }} accessibilityLabel="Edit profile">
                  Edit Profile
                </Button>
                <Button mode="outlined" onPress={() => copyText('Username', '@member')} style={{ flex: 1 }} accessibilityLabel="Copy username">
                  Copy
                </Button>
              </View>
            </Card.Content>
          </Card>

          <Card style={{ borderRadius: 12 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                Current chama
              </Text>
              <Text style={{ opacity: 0.7, marginTop: 6 }}>
                {selectedChama ? selectedChama.name : 'No chama selected'}
              </Text>
              <Text style={{ opacity: 0.6, marginTop: 2 }}>{selectedChama ? `Currency: ${selectedChama.currency}` : 'Select a chama to unlock quick actions.'}</Text>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Button mode="contained" onPress={() => navigation.navigate('ChamasTab')} style={{ flex: 1 }} accessibilityLabel="Switch chama">
                  Switch
                </Button>
                <Button
                  mode="outlined"
                  disabled={!selectedChama}
                  onPress={() => navigation.navigate('ChamaHome', { chama: selectedChama })}
                  style={{ flex: 1 }}
                  accessibilityLabel="Open selected chama"
                >
                  Open
                </Button>
              </View>

              {selectedChama ? (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Contributions', { chama: selectedChama })}
                    style={{ flex: 1 }}
                    accessibilityLabel="Add contribution"
                  >
                    Contribution
                  </Button>
                  <Button mode="text" onPress={() => navigation.navigate('Loans', { chama: selectedChama })} style={{ flex: 1 }} accessibilityLabel="Apply for loan">
                    Loan
                  </Button>
                </View>
              ) : null}
            </Card.Content>
          </Card>

          <Card style={{ borderRadius: 12 }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: '900' }}>
                Settings
              </Text>
              <View style={{ marginTop: 6 }}>
                <Row title="Account settings" subtitle="Profile, preferences" onPress={() => navigation.navigate('Settings')} />
                <Divider />
                <Row title="Change password" subtitle="Update your password" onPress={() => navigation.navigate('ChangePassword')} />
                <Divider />
                <Row title="Help & support" subtitle="FAQs and contact" onPress={() => navigation.navigate('Help')} />
                <Divider />
                <Row
                  title="Clear selected chama"
                  subtitle="Remove current chama selection"
                  onPress={() => {
                    clearSelectedChama();
                    Toast.show({ type: 'success', text1: 'Done', text2: 'Selected chama cleared' });
                  }}
                />
                <Divider />
                <Row title="Log out" subtitle="Sign out of this device" onPress={() => setToken(null)} />
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
