import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../ui/themes';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Bem-vindo ao <Text style={styles.logoControl}>Control</Text><Text style={styles.logoTec}>Tec</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background, // Azul escuro
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '600',
    color: Theme.colors.textInverse, // Branco
  },
  logoControl: {
    fontWeight: '900',
    color: Theme.colors.textInverse, // Branco
  },
  logoTec: {
    fontWeight: '900',
    color: Theme.colors.accent, // Amarelo/Laranja
  }
});
