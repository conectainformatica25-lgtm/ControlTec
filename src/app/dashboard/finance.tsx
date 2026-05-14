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
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Theme } from '../../ui/themes';
import { Search, Plus, TrendingUp, TrendingDown, X, Edit2, Trash2 } from 'lucide-react-native';
import { api } from '../../services/api';

export default function FinanceScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    description: '',
    type: 'receita',
    amount: '0',
    category: '',
    status: 'Pendente'
  });

  const fetchData = async () => {
    try {
      const data = await api.getAll('finance');
      setTransactions(data);
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
    if (!formData.description) return alert('Descrição é obrigatória');
    setSaveLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0
      };
      if (formData.id) {
        await api.update('finance', formData.id, payload);
      } else {
        const { id, ...data } = payload;
        await api.create('finance', data);
      }
      setModalVisible(false);
      fetchData();
      setFormData({ id: '', description: '', type: 'receita', amount: '0', category: '', status: 'Pendente' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este lançamento?')) {
      try {
        await api.remove('finance', id);
        fetchData();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalIncome = transactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'despesa').reduce((acc, t) => acc + t.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Financeiro</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setFormData({ id: '', description: '', type: 'receita', amount: '0', category: '', status: 'Pendente' });
            setModalVisible(true);
          }}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Lançamento</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryCards, isMobile && styles.summaryCardsMobile]}>
        <View style={[styles.summaryCard, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.summaryLabel}>Total Receitas</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>R$ {totalIncome.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.summaryLabel}>Total Despesas</Text>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>R$ {totalExpense.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Theme.colors.accent }]}>
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={styles.summaryValue}>R$ {(totalIncome - totalExpense).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por descrição ou categoria..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView style={styles.listContainer}>
            {!isMobile && (
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Descrição / Categoria</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Valor</Text>
                <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>Ações</Text>
              </View>
            )}

            {filtered.map((item) => (
              isMobile ? (
                <View key={item.id} style={styles.mobileCard}>
                  <View style={styles.mobileCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.description}</Text>
                      <Text style={styles.itemSub}>{item.category}</Text>
                    </View>
                    <View style={styles.mobileActions}>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}><Trash2 size={18} color="#DC3545" /></TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.mobileCardBody}>
                    <Text style={[styles.priceText, { color: item.type === 'receita' ? '#10B981' : '#EF4444' }]}>
                      {item.type === 'receita' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Recebido' || item.status === 'Pago' ? '#D4EDDA' : '#FFF3CD' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'Recebido' || item.status === 'Pago' ? '#155724' : '#856404' }]}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View key={item.id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.itemName}>{item.description}</Text>
                    <Text style={styles.itemSub}>{item.category}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Recebido' || item.status === 'Pago' ? '#D4EDDA' : '#FFF3CD', alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'Recebido' || item.status === 'Pago' ? '#155724' : '#856404' }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.priceText, { flex: 1, color: item.type === 'receita' ? '#10B981' : '#EF4444' }]}>
                    {item.type === 'receita' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                  </Text>
                  <View style={{ width: 80, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}><Trash2 size={18} color="#DC3545" /></TouchableOpacity>
                  </View>
                </View>
              )
            ))}
          </ScrollView>
        )}
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Lançamento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X color={Theme.colors.textSecondary} size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput style={styles.input} value={formData.description} onChangeText={v => setFormData({...formData, description: v})} />
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Tipo</Text>
                  <View style={styles.selectWrapper}>
                    <select style={styles.htmlSelect} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option value="receita">Receita (+)</option>
                      <option value="despesa">Despesa (-)</option>
                    </select>
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Valor (R$)</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={formData.amount} onChangeText={v => setFormData({...formData, amount: v})} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <TextInput style={styles.input} value={formData.category} onChangeText={v => setFormData({...formData, category: v})} />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}><Text style={styles.cancelButtonText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saveLoading}>
                {saveLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Lançar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Theme.spacing.lg, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.textInverse },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.accent, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, borderRadius: Theme.borderRadius.sm },
  addButtonText: { color: Theme.colors.textInverse, fontWeight: 'bold', marginLeft: Theme.spacing.xs },
  summaryCards: { flexDirection: 'row', gap: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  summaryCardsMobile: { flexDirection: 'column' },
  summaryCard: { flex: 1, backgroundColor: Theme.colors.surface, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.md, borderLeftWidth: 5 },
  summaryLabel: { fontSize: 12, color: Theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: 'bold' },
  summaryValue: { fontSize: 20, fontWeight: '900', marginTop: 4, color: Theme.colors.textPrimary },
  card: { flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.lg, height: 44 },
  searchInput: { flex: 1, marginLeft: Theme.spacing.sm, fontSize: 15, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  listContainer: { flex: 1 },
  tableHeader: { flexDirection: 'row', paddingBottom: Theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, marginBottom: Theme.spacing.sm },
  tableHeaderText: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.inputBackground },
  itemName: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  itemSub: { fontSize: 13, color: Theme.colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  priceText: { fontSize: 15, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: Theme.spacing.xl, color: Theme.colors.textSecondary, fontSize: 16 },
  mobileCard: { backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Theme.spacing.sm },
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
  selectWrapper: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm },
  htmlSelect: { width: '100%', height: '100%', border: 'none', background: 'transparent', padding: '0 10px', fontSize: 16, outline: 'none' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: Theme.spacing.lg, borderTopWidth: 1, borderTopColor: Theme.colors.border, gap: Theme.spacing.md },
  cancelButton: { paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.lg },
  cancelButtonText: { fontSize: 16, color: Theme.colors.textSecondary, fontWeight: '600' },
  saveButton: { backgroundColor: Theme.colors.primary, paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.xl, borderRadius: Theme.borderRadius.sm, minWidth: 100, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
