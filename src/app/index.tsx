import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../ui/themes';
import { Lock, Mail, ChevronRight } from 'lucide-react-native';
import { api } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
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
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
      <View style={styles.centeredWrap}>
        <View style={styles.brandContainer}>
          <Text style={styles.logoText}>
            Control<Text style={styles.logoAccent}>Tec</Text>
          </Text>
          <Text style={styles.brandSubtitle}>
            Soluções completas para sua assistência técnica
          </Text>
        </View>

        <View style={styles.formContainer}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
  },
  keyboardRoot: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centeredWrap: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    maxWidth: 400,
    width: '100%',
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: Theme.colors.textInverse,
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
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
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
    borderRadius: Theme.borderRadius.md,
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
    backgroundColor: Theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: Theme.borderRadius.md,
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
});
