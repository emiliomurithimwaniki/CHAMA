import React from 'react';
import { View } from 'react-native';

export default function GradientHeader({ height = 150, children }) {
  return (
    <View style={{ height }}>
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#2563eb',
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: -80,
          top: -60,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(124,58,237,0.55)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: -90,
          bottom: -110,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: 'rgba(255,255,255,0.16)',
        }}
      />
      <View style={{ flex: 1, padding: 14, justifyContent: 'flex-end' }}>{children}</View>
    </View>
  );
}
