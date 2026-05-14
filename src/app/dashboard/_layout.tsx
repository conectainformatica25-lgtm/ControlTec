import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../ui/themes';
import TopBar from '../../ui/components/TopBar';

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* O TopBar sempre ficará fixo no topo deste Layout */}
      <TopBar />
      
      {/* O conteúdo dinâmico (as telas como index.tsx, customers.tsx) será renderizado aqui */}
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, Theme.spacing.sm) }]}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background, // Fundo Azul Escuro do sistema
  },
  content: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
});
