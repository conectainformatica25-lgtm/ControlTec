import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Theme } from '../../ui/themes';
import { Search, Plus, FileText, User, X, Edit2, Trash2, ChevronRight } from 'lucide-react-native';
import { api } from '../../services/api';
import { useBreakpoints } from '../../ui/useBreakpoints';

export default function EstimatesScreen() {
  const { isCompact, useTableLayout } = useBreakpoints();
  
  const [search, setSearch] = useState('');
  const [estimates, setEstimates] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    status: 'Pendente',
    description: '',
    items: '[]',
    totalValue: '0',
    validUntil: '',
    customerId: ''
  });

  const fetchData = async () => {
    try {
      const [estData, custData] = await Promise.all([
        api.getAll('estimates'),
        api.getAll('customers')
      ]);
      setEstimates(estData);
      setCustomers(custData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.customerId || !formData.description) {
      alert('Cliente e Descrição são obrigatórios');
      return;
    }
    setSaveLoading(true);
    try {
      const payload = {
        ...formData,
        totalValue: parseFloat(formData.totalValue) || 0
      };
      if (formData.id) {
        await api.update('estimates', formData.id, payload);
      } else {
        const { id, ...data } = payload;
        await api.create('estimates', data);
      }
      setModalVisible(false);
      fetchData();
      setFormData({ id: '', status: 'Pendente', description: '', items: '[]', totalValue: '0', validUntil: '', customerId: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      ...item,
      totalValue: String(item.totalValue)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const performDelete = async () => {
      try {
        await api.remove('estimates', id);
        fetchData();
      } catch (error: any) {
        alert(error.message);
      }
    };
    if (Platform.OS === 'web') {
      if (confirm('Deseja excluir este orçamento?')) performDelete();
    } else {
      Alert.alert('Confirmação', 'Deseja excluir este orçamento?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const filtered = estimates.filter(e => 
    (e.customer?.name.toLowerCase().includes(search.toLowerCase())) ||
    (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isCompact ? styles.headerCompact : undefined]}>
        <Text style={[styles.pageTitle, isCompact ? styles.pageTitleBlock : undefined]}>Orçamentos</Text>
        <TouchableOpacity 
          style={[styles.addButton, isCompact ? styles.addButtonBlock : undefined]} 
          onPress={() => {
            setFormData({ id: '', status: 'Pendente', description: '', items: '[]', totalValue: '0', validUntil: '', customerId: '' });
            setModalVisible(true);
          }}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Orçamento</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por cliente ou descrição..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView style={styles.listContainer}>
            {!useTableLayout && (
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Cliente / Descrição</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
                <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>Ações</Text>
              </View>
            )}

            {filtered.map((item) => (
              !useTableLayout ? (
                <View key={item.id} style={styles.mobileCard}>
                  <View style={styles.mobileCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.customer?.name}</Text>
                      <Text style={styles.itemSub} numberOfLines={1}>{item.description}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={[styles.statusText, { color: item.status === 'Aprovado' ? '#10B981' : '#F59E0B' }]}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.mobileCardBody}>
                    <Text style={styles.priceText}>R$ {item.totalValue.toFixed(2)}</Text>
                    <View style={styles.mobileActions}>
                      <TouchableOpacity onPress={() => handleEdit(item)}><Edit2 size={18} color={Theme.colors.primary} /></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}><Trash2 size={18} color="#DC3545" /></TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View key={item.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.itemName}>{item.customer?.name}</Text>
                    <Text style={styles.itemSub}>{item.description}</Text>
                  </View>
                  <Text style={[styles.statusText, { flex: 1, color: item.status === 'Aprovado' ? '#10B981' : '#F59E0B' }]}>{item.status}</Text>
                  <Text style={[styles.priceText, { flex: 1 }]}>R$ {item.totalValue.toFixed(2)}</Text>
                  <View style={{ width: 80, flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => handleEdit(item)}><Edit2 size={18} color={Theme.colors.primary} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}><Trash2 size={18} color="#DC3545" /></TouchableOpacity>
                  </View>
                </View>
              )
            ))}
            
            {filtered.length === 0 && (
              <Text style={styles.emptyText}>Nenhum orçamento encontrado.</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{formData.id ? 'Editar Orçamento' : 'Novo Orçamento'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X color={Theme.colors.textSecondary} size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cliente</Text>
                <View style={styles.selectWrapper}>
                  <select style={styles.htmlSelect} value={formData.customerId} onChange={(e) => setFormData({...formData, customerId: e.target.value})}>
                    <option value="">Selecione um cliente</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição Geral</Text>
                <TextInput style={[styles.input, styles.textArea]} multiline value={formData.description} onChangeText={v => setFormData({...formData, description: v})} />
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Valor Total</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={formData.totalValue} onChangeText={v => setFormData({...formData, totalValue: v})} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.selectWrapper}>
                    <select style={styles.htmlSelect} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="Pendente">Pendente</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Recusado">Recusado</option>
                    </select>
                  </View>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}><Text style={styles.cancelButtonText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saveLoading}>
                {saveLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Theme.spacing.lg, backgroundColor: Theme.colors.background, minWidth: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg, gap: Theme.spacing.md },
  headerCompact: { flexDirection: 'column', alignItems: 'stretch' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.textInverse },
  pageTitleBlock: { flexShrink: 1 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.accent, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, borderRadius: Theme.borderRadius.sm },
  addButtonBlock: { alignSelf: 'stretch', justifyContent: 'center' },
  addButtonText: { color: Theme.colors.textInverse, fontWeight: 'bold', marginLeft: Theme.spacing.xs },
  card: { flex: 1, minHeight: 0, minWidth: 0, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.lg, height: 44 },
  searchInput: { flex: 1, marginLeft: Theme.spacing.sm, fontSize: 15, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  listContainer: { flex: 1 },
  tableHeader: { flexDirection: 'row', paddingBottom: Theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, marginBottom: Theme.spacing.sm },
  tableHeaderText: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.inputBackground, minWidth: 0 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  itemSub: { fontSize: 13, color: Theme.colors.textSecondary },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  priceText: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  emptyText: { textAlign: 'center', marginTop: Theme.spacing.xl, color: Theme.colors.textSecondary, fontSize: 16 },
  mobileCard: { backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Theme.spacing.sm },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: '#FFF' },
  mobileCardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  mobileActions: { flexDirection: 'row', gap: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.lg },
  modalContent: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, width: '100%', maxWidth: 500, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textPrimary },
  modalForm: { padding: Theme.spacing.lg },
  inputGroup: { marginBottom: Theme.spacing.md },
  inputRow: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.xs },
  input: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, fontSize: 16, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  textArea: { height: 80, paddingTop: 10 },
  selectWrapper: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm },
  htmlSelect: { width: '100%', height: '100%', border: 'none', background: 'transparent', padding: '0 10px', fontSize: 16, outline: 'none' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: Theme.spacing.lg, borderTopWidth: 1, borderTopColor: Theme.colors.border, gap: Theme.spacing.md },
  cancelButton: { paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.lg },
  cancelButtonText: { fontSize: 16, color: Theme.colors.textSecondary, fontWeight: '600' },
  saveButton: { backgroundColor: Theme.colors.primary, paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.xl, borderRadius: Theme.borderRadius.sm, minWidth: 100, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
