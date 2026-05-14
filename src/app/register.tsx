import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../ui/themes';
import { User, Mail, Lock, Building, CreditCard, ChevronLeft } from 'lucide-react-native';
import { api } from '../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    cnpj: ''
  });

  const handleRegister = async () => {
    const { name, email, password, companyName, cnpj } = formData;
    
    if (!name || !email || !password || !companyName || !cnpj) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(formData);
      api.setToken(response.token);
      router.replace('/dashboard');
    } catch (error: any) {
      alert(error.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft color={Theme.colors.textInverse} size={24} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <View style={[styles.content, isDesktop && styles.contentDesktop]}>
          <View style={[styles.brandContainer, isDesktop && styles.brandContainerDesktop]}>
            <Text style={styles.logoText}>
              Control<Text style={styles.logoAccent}>Tec</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              Comece a gerenciar sua assistência técnica agora mesmo de forma profissional.
            </Text>
          </View>

          <View style={[styles.formContainer, isDesktop && styles.formContainerDesktop]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Crie sua conta</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Seu Nome</Text>
                <View style={styles.inputWrapper}>
                  <User color={Theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChangeText={(val) => setFormData({...formData, name: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputWrapper}>
                  <Mail color={Theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="email@exemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(val) => setFormData({...formData, email: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome da Empresa</Text>
                <View style={styles.inputWrapper}>
                  <Building color={Theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Razão Social ou Fantasia"
                    value={formData.companyName}
                    onChangeText={(val) => setFormData({...formData, companyName: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CNPJ</Text>
                <View style={styles.inputWrapper}>
                  <CreditCard color={Theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="00.000.000/0001-00"
                    keyboardType="numeric"
                    value={formData.cnpj}
                    onChangeText={(val) => setFormData({...formData, cnpj: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrapper}>
                  <Lock color={Theme.colors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(val) => setFormData({...formData, password: val})}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, loading && { opacity: 0.7 }]} 
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Cadastrando...' : 'Criar Minha Conta'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl * 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  backButtonText: {
    color: Theme.colors.textInverse,
    fontSize: 16,
    marginLeft: Theme.spacing.xs,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  contentDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: Theme.spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  brandContainerDesktop: {
    alignItems: 'flex-start',
    marginBottom: 0,
    flex: 1,
    paddingRight: Theme.spacing.xl * 2,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: Theme.colors.textInverse,
  },
  logoAccent: {
    color: Theme.colors.accent,
  },
  brandSubtitle: {
    fontSize: 14,
    color: Theme.colors.textInverse,
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  formContainerDesktop: {
    flex: 1,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
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
  registerButton: {
    backgroundColor: Theme.colors.accent,
    height: 52,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  registerButtonText: {
    color: Theme.colors.textInverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
