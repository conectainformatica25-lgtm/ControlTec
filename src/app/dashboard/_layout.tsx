import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { Theme } from '../../ui/themes';
import TopBar from '../../ui/components/TopBar';

export default function DashboardLayout() {
  return (
    <View style={styles.container}>
      {/* O TopBar sempre ficará fixo no topo deste Layout */}
      <TopBar />
      
      {/* O conteúdo dinâmico (as telas como index.tsx, customers.tsx) será renderizado aqui */}
      <View style={styles.content}>
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
    // Pode adicionar paddings aqui se desejar que todas as telas internas tenham respiro
  }
});
