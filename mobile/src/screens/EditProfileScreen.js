import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, Button, Card, Text, TextInput } from 'react-native-paper';

export default function EditProfileScreen({ navigation }) {
  const [fullName, setFullName] = useState('User');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const onSave = () => {
    Toast.show({ type: 'success', text1: 'Saved', text2: 'Profile updated (local demo)' });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>

      <View style={{ padding: 14, gap: 12 }}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '900' }}>
              Account
            </Text>
            <View style={{ marginTop: 12, gap: 12 }}>
              <TextInput mode="outlined" label="Full name" value={fullName} onChangeText={setFullName} />
              <TextInput mode="outlined" label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TextInput mode="outlined" label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={onSave} contentStyle={{ paddingVertical: 8 }}>
          Save
        </Button>
      </View>
    </SafeAreaView>
  );
}
