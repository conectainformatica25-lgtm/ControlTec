import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Platform
} from 'react-native';
import { Theme } from '../../ui/themes';
import { 
  Building2, User, Bell, Shield, Palette, Printer, 
  Save, ChevronRight, LogOut, Mail, Phone, MapPin
} from 'lucide-react-native';

type SectionId = 'empresa' | 'usuario' | 'notificacoes' | 'seguranca' | 'aparencia' | 'impressao';

const MENU_ITEMS: { id: SectionId; title: string; desc: string; icon: any }[] = [
  { id: 'empresa', title: 'Dados da Empresa', desc: 'CNPJ, endereço e contato', icon: Building2 },
  { id: 'usuario', title: 'Meu Perfil', desc: 'Nome, e-mail e senha', icon: User },
  { id: 'notificacoes', title: 'Notificações', desc: 'Alertas e avisos do sistema', icon: Bell },
  { id: 'seguranca', title: 'Segurança', desc: 'Senha e autenticação', icon: Shield },
  { id: 'aparencia', title: 'Aparência', desc: 'Tema e personalização', icon: Palette },
  { id: 'impressao', title: 'Impressão', desc: 'Modelo de OS e orçamento', icon: Printer },
];

export default function SettingsScreen() {
  const [activeSection, setActiveSection] = useState<SectionId>('empresa');

  // Estados dos toggles
  const [notifOS, setNotifOS] = useState(true);
  const [notifEstoque, setNotifEstoque] = useState(true);
  const [notifFinanceiro, setNotifFinanceiro] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  const [printLogo, setPrintLogo] = useState(true);
  const [printTerms, setPrintTerms] = useState(true);

  const renderContent = () => {
    switch (activeSection) {
      case 'empresa':
        return (
          <View>
            <Text style={styles.sectionTitle}>Dados da Empresa</Text>
            <Text style={styles.sectionDesc}>
              Informações exibidas nos documentos e orçamentos.
            </Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Razão Social</Text>
              <TextInput style={styles.input} defaultValue="ControlTec Assistência Técnica" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome Fantasia</Text>
              <TextInput style={styles.input} defaultValue="ControlTec" />
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                <Text style={styles.label}>CNPJ</Text>
                <TextInput style={styles.input} defaultValue="12.345.678/0001-90" />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                <Text style={styles.label}>Inscrição Estadual</Text>
                <TextInput style={styles.input} placeholder="Opcional" />
              </View>
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput style={styles.input} defaultValue="(11) 3333-4444" />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput style={styles.input} defaultValue="contato@controltec.com.br" />
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Endereço Completo</Text>
              <TextInput style={styles.input} defaultValue="Rua Exemplo, 123 - Centro - São Paulo/SP" />
            </View>
            <TouchableOpacity style={styles.saveBtn}>
              <Save size={18} color={Theme.colors.textInverse} />
              <Text style={styles.saveBtnText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        );

      case 'usuario':
        return (
          <View>
            <Text style={styles.sectionTitle}>Meu Perfil</Text>
            <Text style={styles.sectionDesc}>Gerencie suas informações pessoais.</Text>
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>CT</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>Administrador</Text>
                <Text style={styles.profileRole}>Gerente • Acesso Total</Text>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput style={styles.input} defaultValue="Administrador do Sistema" />
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput style={styles.input} defaultValue="admin@controltec.com.br" />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput style={styles.input} defaultValue="(11) 98765-4321" />
              </View>
            </View>
            <TouchableOpacity style={styles.saveBtn}>
              <Save size={18} color={Theme.colors.textInverse} />
              <Text style={styles.saveBtnText}>Salvar Perfil</Text>
            </TouchableOpacity>
          </View>
        );

      case 'notificacoes':
        return (
          <View>
            <Text style={styles.sectionTitle}>Notificações</Text>
            <Text style={styles.sectionDesc}>Controle os alertas do sistema.</Text>
            <ToggleRow label="Novas Ordens de Serviço" desc="Aviso ao abrir ou concluir OS" value={notifOS} onToggle={setNotifOS} />
            <ToggleRow label="Alertas de Estoque Baixo" desc="Quando peças atingirem nível mínimo" value={notifEstoque} onToggle={setNotifEstoque} />
            <ToggleRow label="Movimentações Financeiras" desc="Receitas e despesas registradas" value={notifFinanceiro} onToggle={setNotifFinanceiro} />
            <ToggleRow label="Notificações por E-mail" desc="Receber cópia por e-mail" value={notifEmail} onToggle={setNotifEmail} />
          </View>
        );

      case 'seguranca':
        return (
          <View>
            <Text style={styles.sectionTitle}>Segurança</Text>
            <Text style={styles.sectionDesc}>Proteja sua conta e seus dados.</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Senha Atual</Text>
              <TextInput style={styles.input} placeholder="••••••••" secureTextEntry />
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                <Text style={styles.label}>Nova Senha</Text>
                <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" secureTextEntry />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                <Text style={styles.label}>Confirmar Nova Senha</Text>
                <TextInput style={styles.input} placeholder="Repita a nova senha" secureTextEntry />
              </View>
            </View>
            <ToggleRow label="Autenticação em 2 fatores" desc="Camada extra de segurança no login" value={twoFactor} onToggle={setTwoFactor} />
            <ToggleRow label="Bloqueio automático" desc="Deslogar após 30 min de inatividade" value={autoLock} onToggle={setAutoLock} />
            <TouchableOpacity style={styles.saveBtn}>
              <Save size={18} color={Theme.colors.textInverse} />
              <Text style={styles.saveBtnText}>Atualizar Senha</Text>
            </TouchableOpacity>
          </View>
        );

      case 'aparencia':
        return (
          <View>
            <Text style={styles.sectionTitle}>Aparência</Text>
            <Text style={styles.sectionDesc}>Personalize o visual do sistema.</Text>
            <ToggleRow label="Modo Escuro" desc="Tema dark para o sistema" value={darkMode} onToggle={setDarkMode} />
            <ToggleRow label="Modo Compacto" desc="Reduz espaçamentos e tamanhos" value={compactMode} onToggle={setCompactMode} />
            <Text style={[styles.label, { marginTop: Theme.spacing.lg }]}>Cor Principal</Text>
            <View style={styles.colorRow}>
              {['#0F2A5A', '#1B4332', '#7B2D26', '#4A1A6B', '#1A3C5A'].map(c => (
                <TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor: c }, 
                  c === '#0F2A5A' && styles.colorCircleActive
                ]} />
              ))}
            </View>
            <Text style={[styles.label, { marginTop: Theme.spacing.lg }]}>Cor de Destaque</Text>
            <View style={styles.colorRow}>
              {['#FFB703', '#FF6B35', '#06D6A0', '#118AB2', '#EF476F'].map(c => (
                <TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor: c },
                  c === '#FFB703' && styles.colorCircleActive
                ]} />
              ))}
            </View>
          </View>
        );

      case 'impressao':
        return (
          <View>
            <Text style={styles.sectionTitle}>Impressão</Text>
            <Text style={styles.sectionDesc}>Configure os modelos de impressão.</Text>
            <ToggleRow label="Incluir Logo da Empresa" desc="Exibir logotipo no cabeçalho" value={printLogo} onToggle={setPrintLogo} />
            <ToggleRow label="Termos e Condições" desc="Adicionar termos no rodapé da OS" value={printTerms} onToggle={setPrintTerms} />
            <View style={styles.formGroup}>
              <Text style={styles.label}>Texto de Garantia (Rodapé)</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                defaultValue="Garantia de 90 dias para peças e serviços, exceto mau uso."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Observações Padrão (Orçamento)</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                defaultValue="Orçamento válido por 15 dias. Valores sujeitos a alteração."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity style={styles.saveBtn}>
              <Save size={18} color={Theme.colors.textInverse} />
              <Text style={styles.saveBtnText}>Salvar Configurações</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Configurações</Text>

      <View style={styles.mainCard}>
        {/* Menu Lateral */}
        <View style={styles.sidebar}>
          {MENU_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => setActiveSection(item.id)}
              >
                <Icon size={20} color={isActive ? Theme.colors.primary : Theme.colors.textSecondary} />
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuTitle, isActive && styles.menuTitleActive]}>
                    {item.title}
                  </Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <ChevronRight size={16} color={isActive ? Theme.colors.primary : Theme.colors.border} />
              </TouchableOpacity>
            );
          })}

          {/* Botão Sair */}
          <TouchableOpacity style={styles.logoutBtn}>
            <LogOut size={20} color="#DC3545" />
            <Text style={styles.logoutText}>Sair do Sistema</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <ScrollView style={styles.content}>
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
}

// Componente auxiliar Toggle
const ToggleRow = ({ label, desc, value, onToggle }: { 
  label: string; desc: string; value: boolean; onToggle: (v: boolean) => void 
}) => (
  <View style={toggleStyles.row}>
    <View style={toggleStyles.info}>
      <Text style={toggleStyles.label}>{label}</Text>
      <Text style={toggleStyles.desc}>{desc}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#CCC', true: Theme.colors.primary }}
      thumbColor={value ? Theme.colors.accent : '#F4F3F4'}
    />
  </View>
);

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.inputBackground,
  },
  info: { flex: 1, marginRight: Theme.spacing.md },
  label: { fontSize: 15, fontWeight: '600', color: Theme.colors.textPrimary },
  desc: { fontSize: 13, color: Theme.colors.textSecondary, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textInverse,
    marginBottom: Theme.spacing.lg,
  },
  mainCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },

  // Sidebar
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
    padding: Theme.spacing.md,
    justifyContent: 'flex-start',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: 4,
    gap: Theme.spacing.sm,
  },
  menuItemActive: {
    backgroundColor: Theme.colors.inputBackground,
  },
  menuItemText: { flex: 1 },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  menuTitleActive: {
    color: Theme.colors.primary,
  },
  menuDesc: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    gap: Theme.spacing.sm,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC3545',
  },

  // Conteúdo
  content: {
    flex: 1,
    padding: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },

  // Perfil
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.inputBackground,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.lg,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: Theme.colors.accent,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  profileRole: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },

  // Forms
  formGroup: { marginBottom: Theme.spacing.md },
  formRow: { flexDirection: 'row' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    height: 48,
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } })
  },
  textArea: {
    height: 80,
    paddingTop: Theme.spacing.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.md,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.textInverse,
  },

  // Cores
  colorRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: Theme.colors.accent,
    borderWidth: 3,
  },
});
