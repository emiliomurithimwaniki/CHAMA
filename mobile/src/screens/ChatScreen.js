import React, { useEffect, useRef, useState } from 'react';
import { FlatList, SafeAreaView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { Appbar, IconButton, Text, TextInput } from 'react-native-paper';

import { listChannels } from '../api/chamas';
import { apiRequest } from '../api/client';
import { useAuth } from '../state/auth';

export default function ChatScreen({ route }) {
  const { chama, baseUrl } = route.params;
  const { token } = useAuth();
  const [channelId, setChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const wsRef = useRef(null);
  const listRef = useRef(null);

  const loadHistory = async (cid) => {
    const rows = await apiRequest({
      baseUrl,
      path: `/api/v1/chamas/${chama.id}/chat/channels/${cid}/messages?limit=50`,
      token,
    });
    setMessages(rows);
  };

  useEffect(() => {
    (async () => {
      try {
        const channels = await listChannels({ baseUrl, token, chamaId: chama.id });
        const cid = channels?.[0]?.id;
        if (!cid) {
          Toast.show({ type: 'error', text1: 'Chat', text2: 'No channel found' });
          return;
        }
        setChannelId(cid);
        await loadHistory(cid);

        const wsUrl = `${baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')}/ws/chat/${chama.id}?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'NEW_MESSAGE') {
              setMessages((prev) => [...prev, msg.message]);
            }
          } catch (e) {}
        };

        ws.onerror = () => {};
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Error', text2: e.message });
      }
    })();

    return () => {
      try {
        wsRef.current?.close();
      } catch (e) {}
    };
  }, []);

  const send = () => {
    if (!text.trim() || !channelId) return;
    try {
      wsRef.current?.send(
        JSON.stringify({
          type: 'SEND_MESSAGE',
          channelId,
          body: text.trim(),
          messageType: 'text',
        })
      );
      setText('');
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Group Chat" subtitle={chama?.name} />
      </Appbar.Header>

      <View style={{ flex: 1, padding: 12 }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item, index }) => (
            <View style={{ marginBottom: 8 }}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '90%',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 14,
                  backgroundColor: 'rgba(37,99,235,0.08)',
                }}
              >
                <Text variant="labelSmall" style={{ opacity: 0.6 }}>
                  {item.sender_user_id}
                </Text>
                <Text variant="bodyLarge">{item.body}</Text>
              </View>
            </View>
          )}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <TextInput
            mode="outlined"
            value={text}
            onChangeText={setText}
            placeholder="Message"
            style={{ flex: 1 }}
          />
          <IconButton icon="send" onPress={send} disabled={!text.trim()} />
        </View>
      </View>
    </SafeAreaView>
  );
}
