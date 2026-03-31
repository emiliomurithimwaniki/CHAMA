import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

function TabItem({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontWeight: active ? '800' : '700', opacity: active ? 1 : 0.6 }}>{label}</Text>
    </Pressable>
  );
}

export default function TabBar({ state, descriptors, navigation }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
        backgroundColor: 'white',
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'AddTab') {
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center' }}>
              <Pressable
                onPress={onPress}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#2563eb',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -26,
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 6,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 24, lineHeight: 24 }}>+</Text>
              </Pressable>
              <View style={{ height: 6 }} />
            </View>
          );
        }

        const mappedLabel =
          route.name === 'HomeTab'
            ? 'Home'
            : route.name === 'ChamasTab'
              ? 'Chamas'
              : route.name === 'ActivityTab'
                ? 'Activity'
                : route.name === 'ProfileTab'
                  ? 'Profile'
                  : String(label);

        return <TabItem key={route.key} label={mappedLabel} active={isFocused} onPress={onPress} />;
      })}
    </View>
  );
}
