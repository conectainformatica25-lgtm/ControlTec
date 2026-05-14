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
import { Search, Plus, ClipboardList, User, MonitorSmartphone, X, Edit2, Trash2, Clock } from 'lucide-react-native';
import { api } from '../../services/api';

export default function OSScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    status: 'Aberto',
    description: '',
    defect: '',
    observations: '',
    totalValue: '0',
    customerId: '',
    deviceId: ''
  });

  const fetchData = async () => {
    try {
      const [ordData, custData, devData] = await Promise.all([
        api.getAll('orders'),
        api.getAll('customers'),
        api.getAll('devices')
      ]);
      setOrders(ordData);
      setCustomers(custData);
      setDevices(devData);
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
    if (!formData.customerId || !formData.deviceId) {
      alert('Cliente e Aparelho são obrigatórios');
      return;
    }
    setSaveLoading(true);
    try {
      const payload = {
        ...formData,
        totalValue: parseFloat(formData.totalValue) || 0
      };
      if (formData.id) {
        await api.update('orders', formData.id, payload);
      } else {
        const { id, ...data } = payload;
        await api.create('orders', data);
      }
      setModalVisible(false);
      fetchData();
      setFormData({ id: '', status: 'Aberto', description: '', defect: '', observations: '', totalValue: '0', customerId: '', deviceId: '' });
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
        await api.remove('orders', id);
        fetchData();
      } catch (error: any) {
        alert(error.message);
      }
    };
    if (Platform.OS === 'web') {
      if (confirm('Deseja excluir esta OS?')) performDelete();
    } else {
      Alert.alert('Confirmação', 'Deseja excluir esta OS?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return '#4F46E5';
      case 'Em Análise': return '#F59E0B';
      case 'Aguardando Peça': return '#EF4444';
      case 'Pronto': return '#10B981';
      case 'Concluído': return '#6B7280';
      default: return '#000';
    }
  };

  const filtered = orders.filter(o => 
    (o.customer?.name.toLowerCase().includes(search.toLowerCase())) ||
    (o.device?.model.toLowerCase().includes(search.toLowerCase())) ||
    (o.description && o.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Ordens de Serviço</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setFormData({ id: '', status: 'Aberto', description: '', defect: '', observations: '', totalValue: '0', customerId: '', deviceId: '' });
            setModalVisible(true);
          }}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Nova OS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por cliente, aparelho ou descrição..."
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
                <Text style={[styles.tableHeaderText, { width: 80 }]}>OS #</Text>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Cliente / Aparelho</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
                <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>Ações</Text>
              </View>
            )}

            {filtered.map((item) => (
              isMobile ? (
                <View key={item.id} style={styles.mobileCard}>
                  <View style={styles.mobileCardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.osNumber}>#{item.id.slice(-4).toUpperCase()}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.itemName}>{item.customer?.name}</Text>
                      <Text style={styles.itemSub}>{item.device?.brand} {item.device?.model}</Text>
                    </View>
                    <View style={styles.mobileActions}>
                      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionIcon}>
                        <Edit2 size={18} color={Theme.colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionIcon}>
                        <Trash2 size={18} color="#DC3545" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.mobileCardBody}>
                    <Text style={styles.priceText}>R$ {item.totalValue.toFixed(2)}</Text>
                  </View>
                </View>
              ) : (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.osNumber, { width: 80 }]}>#{item.id.slice(-4).toUpperCase()}</Text>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.itemName}>{item.customer?.name}</Text>
                    <Text style={styles.itemSub}>{item.device?.brand} {item.device?.model}</Text>
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20', alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.priceText, { flex: 1 }]}>R$ {item.totalValue.toFixed(2)}</Text>
                  <View style={{ width: 80, flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                      <Edit2 size={18} color={Theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Trash2 size={18} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                </View>
              )
            ))}
            
            {filtered.length === 0 && (
              <Text style={styles.emptyText}>Nenhuma OS encontrada.</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal OS */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{formData.id ? 'Editar OS' : 'Nova Ordem de Serviço'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Cliente</Text>
                  <View style={styles.selectWrapper}>
                    <select 
                      style={styles.htmlSelect}
                      value={formData.customerId}
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    >
                      <option value="">Selecione</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Aparelho</Text>
                  <View style={styles.selectWrapper}>
                    <select 
                      style={styles.htmlSelect}
                      value={formData.deviceId}
                      onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                    >
                      <option value="">Selecione</option>
                      {devices.filter(d => d.customerId === formData.customerId).map(d => (
                        <option key={d.id} value={d.id}>{d.brand} {d.model}</option>
                      ))}
                    </select>
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.selectWrapper}>
                  <select 
                    style={styles.htmlSelect}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Aguardando Peça">Aguardando Peça</option>
                    <option value="Pronto">Pronto</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Defeito Relatado</Text>
                <TextInput style={[styles.input, styles.textArea]} multiline value={formData.defect} onChangeText={v => setFormData({...formData, defect: v})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição do Serviço</Text>
                <TextInput style={[styles.input, styles.textArea]} multiline value={formData.description} onChangeText={v => setFormData({...formData, description: v})} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor Total (R$)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={formData.totalValue} onChangeText={v => setFormData({...formData, totalValue: v})} />
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saveLoading}>
                {saveLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar OS</Text>}
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
  card: { flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.lg, height: 44 },
  searchInput: { flex: 1, marginLeft: Theme.spacing.sm, fontSize: 15, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  listContainer: { flex: 1 },
  tableHeader: { flexDirection: 'row', paddingBottom: Theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, marginBottom: Theme.spacing.sm },
  tableHeaderText: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.inputBackground },
  osNumber: { fontSize: 14, fontWeight: '900', color: Theme.colors.primary, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  itemName: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  itemSub: { fontSize: 13, color: Theme.colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  priceText: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  emptyText: { textAlign: 'center', marginTop: Theme.spacing.xl, color: Theme.colors.textSecondary, fontSize: 16 },
  mobileCard: { backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Theme.spacing.sm },
  mobileActions: { flexDirection: 'row', gap: 15 },
  actionIcon: { padding: 4 },
  mobileCardBody: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.lg },
  modalContent: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, width: '100%', maxWidth: 600, maxHeight: '90%' },
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
