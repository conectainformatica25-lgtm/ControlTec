import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../ui/themes';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Empresa</Text>
      <Text style={styles.subtitle}>Tela em desenvolvimento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.sm,
  }
});
