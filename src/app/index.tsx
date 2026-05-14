import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, useWindowDimensions, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../ui/themes';
import { Lock, Mail, ChevronRight } from 'lucide-react-native';
import { api } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(email, password);
      api.setToken(response.token);
      router.replace('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgDecorationTopRight} />
      <View style={styles.bgDecorationBottomLeft}>
        <View style={styles.bgCircleLarge} />
        <View style={styles.bgCircleSmall} />
      </View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        
        <View style={[styles.brandContainer, isDesktop && styles.brandContainerDesktop]}>
          <Text style={styles.logoText}>
            Control<Text style={styles.logoAccent}>Tec</Text>
          </Text>
          <Text style={styles.brandSubtitle}>
            Soluções completas para sua assistência técnica
          </Text>
          {isDesktop && (
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>✓ Gestão de Clientes e Aparelhos</Text>
              <Text style={styles.featureItem}>✓ Ordens de Serviço em Tempo Real</Text>
              <Text style={styles.featureItem}>✓ Controle Financeiro e Estoque</Text>
            </View>
          )}
        </View>

        <View style={[styles.formContainer, isDesktop && styles.formContainerDesktop]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Acesse sua conta</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <Mail color={Theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu e-mail cadastrado"
                  placeholderTextColor={Theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Lock color={Theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Sua senha"
                  placeholderTextColor={Theme.colors.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, loading && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
              {!loading && <ChevronRight color={Theme.colors.textInverse} size={20} />}
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Cadastre sua empresa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primary, // Fundo Azul Escuro Navy
    overflow: 'hidden',
  },
  // Decorações de fundo (Bolinhas laranjas e detalhes inspirados na imagem)
  bgDecorationBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircleLarge: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Theme.colors.accent,
    opacity: 0.8,
  },
  bgCircleSmall: {
    position: 'absolute',
    top: 0,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.accent,
  },
  bgDecorationTopRight: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Azul clarinho translúcido
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  contentDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: Theme.spacing.xl * 2,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl * 1.5,
    zIndex: 10,
  },
  brandContainerDesktop: {
    alignItems: 'flex-start',
    marginBottom: 0,
    flex: 1,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: Theme.colors.textInverse, // Branco
    letterSpacing: -1,
  },
  logoAccent: {
    color: Theme.colors.accent, // Laranja/Amarelo
  },
  brandSubtitle: {
    fontSize: 16,
    color: Theme.colors.textInverse,
    opacity: 0.8,
    marginTop: Theme.spacing.xs,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 10,
  },
  formContainerDesktop: {
    flex: 1,
    alignItems: 'flex-end',
  },
  card: {
    backgroundColor: Theme.colors.surface, // Branco
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    color: Theme.colors.textPrimary,
    fontSize: 16,
    ...Platform.select({
      web: { outlineStyle: 'none' }
    }),
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Theme.spacing.sm,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: Theme.colors.accent, // Amarelo/Laranja
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.md,
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: Theme.colors.textInverse, // Texto branco no botão amarelo
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: Theme.spacing.xs,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  registerText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginRight: Theme.spacing.xs,
  },
  registerLink: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  featuresList: {
    marginTop: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  featureItem: {
    fontSize: 18,
    color: Theme.colors.textInverse,
    opacity: 0.9,
    fontWeight: '500',
  },
});
