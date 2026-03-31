import React from 'react';
import { Pressable, SafeAreaView, View } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';

export default function ChamaHomeScreen({ navigation, route }) {
  const { chama, baseUrl } = route.params;

  const ActionCard = ({ title, subtitle, onPress }) => (
    <Pressable onPress={onPress} style={{ borderRadius: 12, overflow: 'hidden' }}>
      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: '700' }}>
            {title}
          </Text>
          <Text style={{ opacity: 0.7, marginTop: 4 }}>{subtitle}</Text>
        </Card.Content>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={chama.name} />
      </Appbar.Header>

      <View style={{ flex: 1, padding: 14, gap: 12 }}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              Overview
            </Text>
            <Text style={{ opacity: 0.7, marginTop: 6 }}>Currency: {chama.currency}</Text>
          </Card.Content>
        </Card>

        <View style={{ gap: 12 }}>
          <ActionCard
            title="Contributions"
            subtitle="Track payments and history"
            onPress={() => navigation.navigate('Contributions', { chama, baseUrl })}
          />
          <ActionCard title="Loans" subtitle="Apply, approve and monitor" onPress={() => navigation.navigate('Loans', { chama, baseUrl })} />
          <ActionCard title="Group Chat" subtitle="Announcements and messages" onPress={() => navigation.navigate('Chat', { chama, baseUrl })} />
          <ActionCard title="Admin" subtitle="Edit chama and manage members" onPress={() => navigation.navigate('ChamaAdmin', { chama, baseUrl })} />
        </View>
      </View>
    </SafeAreaView>
  );
}
