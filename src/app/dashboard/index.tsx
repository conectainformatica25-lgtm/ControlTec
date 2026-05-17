import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Theme } from '../../ui/themes';
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ArrowRight,
  X,
  Plus
} from 'lucide-react-native';
import { api } from '../../services/api';
import { useBreakpoints } from '../../ui/useBreakpoints';

type ModalType = 'os' | 'cliente' | 'despesa' | null;

export default function Home() {
  const { width, isCompact } = useBreakpoints();
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const [stats, setStats] = useState({
    customers: 0,
    activeOrders: 0,
    monthlyRevenue: 0,
    pendingEstimates: 0
  });
  const [activities, setActivities] = useState<any[]>([]);

  // Dados para modais
  const [customers, setCustomers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);

  // Formulário OS
  const [formOs, setFormOs] = useState({
    status: 'Aberto', description: '', defect: '', totalValue: '0', customerId: '', deviceId: ''
  });

  // Formulário Cliente
  const [formCliente, setFormCliente] = useState({
    name: '', email: '', phone: '', document: '', address: ''
  });

  // Formulário Despesa
  const [formDespesa, setFormDespesa] = useState({
    description: '', type: 'despesa', amount: '0', category: '', status: 'Pendente'
  });

  const fetchStats = async () => {
    try {
      const [custData, orders, finance, estimates, devData] = await Promise.all([
        api.getAll('customers'),
        api.getAll('orders'),
        api.getAll('finance'),
        api.getAll('estimates'),
        api.getAll('devices')
      ]);

      setCustomers(custData);
      setDevices(devData);
      setStats({
        customers: custData.length,
        activeOrders: orders.filter((o: any) => o.status !== 'Concluído').length,
        monthlyRevenue: finance
          .filter((f: any) => f.type === 'receita' && f.status === 'Recebido')
          .reduce((acc: number, f: any) => acc + f.amount, 0),
        pendingEstimates: estimates.filter((e: any) => e.status === 'Pendente').length
      });

      const recentOrders = orders.slice(0, 3).map((o: any) => ({
        id: o.id,
        text: `Nova OS ${o.code} criada`,
        time: new Date(o.createdAt).toLocaleDateString('pt-BR')
      }));
      const recentEstimates = estimates.slice(0, 3).map((e: any) => ({
        id: e.id,
        text: `Orçamento ${e.code} gerado`,
        time: new Date(e.createdAt).toLocaleDateString('pt-BR')
      }));
      
      setActivities([...recentOrders, ...recentEstimates].slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleSaveOs = async () => {
    if (!formOs.customerId || !formOs.deviceId) {
      Alert.alert('Aviso', 'Cliente e Aparelho são obrigatórios');
      return;
    }
    setSaveLoading(true);
    try {
      await api.create('orders', { ...formOs, totalValue: parseFloat(formOs.totalValue) || 0 });
      setActiveModal(null);
      setFormOs({ status: 'Aberto', description: '', defect: '', totalValue: '0', customerId: '', deviceId: '' });
      fetchStats();
    } catch (e: any) { Alert.alert('Erro', e.message); }
    finally { setSaveLoading(false); }
  };

  const handleSaveCliente = async () => {
    if (!formCliente.name) { Alert.alert('Aviso', 'Nome é obrigatório'); return; }
    setSaveLoading(true);
    try {
      await api.create('customers', formCliente);
      setActiveModal(null);
      setFormCliente({ name: '', email: '', phone: '', document: '', address: '' });
      fetchStats();
    } catch (e: any) { Alert.alert('Erro', e.message); }
    finally { setSaveLoading(false); }
  };

  const handleSaveDespesa = async () => {
    if (!formDespesa.description) { Alert.alert('Aviso', 'Descrição é obrigatória'); return; }
    setSaveLoading(true);
    try {
      await api.create('finance', { ...formDespesa, amount: parseFloat(formDespesa.amount) || 0 });
      setActiveModal(null);
      setFormDespesa({ description: '', type: 'despesa', amount: '0', category: '', status: 'Pendente' });
      fetchStats();
    } catch (e: any) { Alert.alert('Erro', e.message); }
    finally { setSaveLoading(false); }
  };

  const kpis = [
    { title: 'Clientes', value: stats.customers, icon: Users, color: '#4F46E5', label: 'Total cadastrados' },
    { title: 'OS Ativas', value: stats.activeOrders, icon: ClipboardList, color: '#10B981', label: 'Em andamento' },
    { title: 'Receita', value: `R$ ${stats.monthlyRevenue.toFixed(2)}`, icon: TrendingUp, color: '#F59E0B', label: 'Este mês' },
    { title: 'Orçamentos', value: stats.pendingEstimates, icon: AlertCircle, color: '#EF4444', label: 'Aguardando aprovação' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accent} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: Math.max(Theme.spacing.md, Math.min(Theme.spacing.xl * 2, width * 0.05)) },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Olá, Bem-vindo!</Text>
            <Text style={styles.dateText}>Confira o resumo da sua assistência técnica hoje.</Text>
          </View>
        </View>

        <View style={[styles.kpiGrid, isCompact ? styles.kpiGridMobile : undefined]}>
          {kpis.map((kpi, index) => (
            <View key={index} style={[styles.kpiCard, isCompact ? styles.kpiCardMobile : undefined]}>
              <View style={[styles.iconContainer, { backgroundColor: kpi.color + '20' }]}>
                <kpi.icon size={24} color={kpi.color} />
              </View>
              <View style={styles.kpiInfo}>
                <Text style={styles.kpiTitle}>{kpi.title}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.mainRow, isCompact ? styles.mainRowMobile : undefined]}>
          <View style={[styles.section, styles.activitySection, isCompact ? styles.sectionMobile : undefined]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Atividades Recentes</Text>
              <TouchableOpacity style={styles.seeAll}>
                <Text style={styles.seeAllText}>Ver todas</Text>
                <ArrowRight size={14} color={Theme.colors.accent} />
              </TouchableOpacity>
            </View>
            {activities.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: Theme.colors.textSecondary }}>Nenhuma atividade recente.</Text>
            ) : activities.map((act, i) => (
              <View key={i} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Clock size={16} color={Theme.colors.textSecondary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{act.text}</Text>
                  <Text style={styles.activityTime}>{act.time}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.section, styles.actionsSection, isCompact ? styles.sectionMobile : undefined]}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('os')}>
                <Text style={styles.actionButtonText}>Nova OS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setActiveModal('cliente')}>
                <Text style={styles.actionButtonText}>Novo Cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }]}
                onPress={() => setActiveModal('despesa')}
              >
                <Text style={[styles.actionButtonText, { color: Theme.colors.textPrimary }]}>Lançar Despesa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ===== MODAL: NOVA OS ===== */}
      <Modal visible={activeModal === 'os'} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Ordem de Serviço</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><X color={Theme.colors.textSecondary} size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cliente *</Text>
                <View style={styles.selectWrapper}>
                  <select style={styles.htmlSelect as any} value={formOs.customerId} onChange={(e: any) => setFormOs({...formOs, customerId: e.target.value})}>
                    <option value="">Selecione um cliente...</option>
                    {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Aparelho *</Text>
                <View style={styles.selectWrapper}>
                  <select style={styles.htmlSelect as any} value={formOs.deviceId} onChange={(e: any) => setFormOs({...formOs, deviceId: e.target.value})}>
                    <option value="">Selecione um aparelho...</option>
                    {devices.map((d: any) => <option key={d.id} value={d.id}>{d.brand} {d.model}</option>)}
                  </select>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Defeito Relatado</Text>
                <TextInput style={[styles.input, { height: 80 }]} multiline value={formOs.defect} onChangeText={v => setFormOs({...formOs, defect: v})} placeholder="Descreva o problema..." placeholderTextColor={Theme.colors.textSecondary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor (R$)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formOs.totalValue} onChangeText={v => setFormOs({...formOs, totalValue: v})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.selectWrapper}>
                  <select style={styles.htmlSelect as any} value={formOs.status} onChange={(e: any) => setFormOs({...formOs, status: e.target.value})}>
                    <option value="Aberto">Aberto</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando Peça">Aguardando Peça</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveModal(null)}><Text style={styles.cancelButtonText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveOs} disabled={saveLoading}>
                {saveLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Criar OS</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== MODAL: NOVO CLIENTE ===== */}
      <Modal visible={activeModal === 'cliente'} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Cliente</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><X color={Theme.colors.textSecondary} size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome Completo *</Text>
                <TextInput style={styles.input} value={formCliente.name} onChangeText={v => setFormCliente({...formCliente, name: v})} placeholder="Nome do cliente" placeholderTextColor={Theme.colors.textSecondary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput style={styles.input} keyboardType="phone-pad" value={formCliente.phone} onChangeText={v => setFormCliente({...formCliente, phone: v})} placeholder="(00) 00000-0000" placeholderTextColor={Theme.colors.textSecondary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput style={styles.input} keyboardType="email-address" value={formCliente.email} onChangeText={v => setFormCliente({...formCliente, email: v})} placeholder="email@exemplo.com" placeholderTextColor={Theme.colors.textSecondary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CPF / CNPJ</Text>
                <TextInput style={styles.input} value={formCliente.document} onChangeText={v => setFormCliente({...formCliente, document: v})} placeholder="000.000.000-00" placeholderTextColor={Theme.colors.textSecondary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Endereço</Text>
                <TextInput style={styles.input} value={formCliente.address} onChangeText={v => setFormCliente({...formCliente, address: v})} placeholder="Rua, Número, Bairro, Cidade" placeholderTextColor={Theme.colors.textSecondary} />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveModal(null)}><Text style={styles.cancelButtonText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCliente} disabled={saveLoading}>
                {saveLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== MODAL: LANÇAR DESPESA ===== */}
      <Modal visible={activeModal === 'despesa'} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lançar Despesa</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><X color={Theme.colors.textSecondary} size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição *</Text>
                <TextInput style={styles.input} value={formDespesa.description} onChangeText={v => setFormDespesa({...formDespesa, description: v})} placeholder="Ex: Compra de peças" placeholderTextColor={Theme.colors.textSecondary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <TextInput style={styles.input} value={formDespesa.category} onChangeText={v => setFormDespesa({...formDespesa, category: v})} placeholder="Ex: Peças, Aluguel, Serviços" placeholderTextColor={Theme.colors.textSecondary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor (R$)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formDespesa.amount} onChangeText={v => setFormDespesa({...formDespesa, amount: v})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.selectWrapper}>
                  <select style={styles.htmlSelect as any} value={formDespesa.status} onChange={(e: any) => setFormDespesa({...formDespesa, status: e.target.value})}>
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                  </select>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveModal(null)}><Text style={styles.cancelButtonText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#EF4444' }]} onPress={handleSaveDespesa} disabled={saveLoading}>
                {saveLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Lançar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { paddingVertical: Theme.spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background },
  header: { marginBottom: Theme.spacing.xl },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.textInverse },
  dateText: { fontSize: 16, color: Theme.colors.textInverse, opacity: 0.7, marginTop: 4 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.md, marginBottom: Theme.spacing.xl },
  kpiGridMobile: { flexDirection: 'column' },
  kpiCard: { flex: 1, minWidth: 200, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  kpiCardMobile: { minWidth: '100%' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md },
  kpiInfo: { flex: 1 },
  kpiTitle: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 20, fontWeight: '900', color: Theme.colors.textPrimary, marginVertical: 2 },
  kpiLabel: { fontSize: 11, color: Theme.colors.textSecondary },
  mainRow: { flexDirection: 'row', gap: Theme.spacing.lg },
  mainRowMobile: { flexDirection: 'column' },
  section: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  sectionMobile: { width: '100%', minWidth: 0 },
  activitySection: { flex: 2 },
  actionsSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textPrimary },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: Theme.colors.accent },
  activityItem: { flexDirection: 'row', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  activityIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Theme.colors.inputBackground, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: Theme.colors.textPrimary, lineHeight: 20 },
  activityTime: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },
  actionsGrid: { gap: Theme.spacing.md, marginTop: Theme.spacing.md },
  actionButton: { backgroundColor: Theme.colors.primary, paddingVertical: Theme.spacing.md, borderRadius: Theme.borderRadius.sm, alignItems: 'center' },
  actionButtonText: { color: Theme.colors.textInverse, fontWeight: 'bold', fontSize: 14 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.lg },
  modalContent: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, width: '100%', maxWidth: 500, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textPrimary },
  modalForm: { padding: Theme.spacing.lg },
  inputGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.xs },
  input: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, fontSize: 16, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  selectWrapper: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm },
  htmlSelect: { width: '100%', height: '100%', border: 'none', background: 'transparent', padding: '0 10px', fontSize: 16, outline: 'none' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: Theme.spacing.lg, borderTopWidth: 1, borderTopColor: Theme.colors.border, gap: Theme.spacing.md },
  cancelButton: { paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.lg },
  cancelButtonText: { fontSize: 16, color: Theme.colors.textSecondary, fontWeight: '600' },
  saveButton: { backgroundColor: Theme.colors.primary, paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.xl, borderRadius: Theme.borderRadius.sm, minWidth: 100, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
