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
import { Search, Plus, MonitorSmartphone, User, X, Edit2, Trash2 } from 'lucide-react-native';
import { api } from '../../services/api';

export default function EquipmentScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    type: 'Smartphone',
    brand: '',
    model: '',
    serialNumber: '',
    customerId: ''
  });

  const fetchData = async () => {
    try {
      const [equipData, custData] = await Promise.all([
        api.getAll('devices'),
        api.getAll('customers')
      ]);
      setEquipment(equipData);
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
    if (!formData.model || !formData.customerId) {
      alert('Modelo e Cliente são obrigatórios');
      return;
    }
    setSaveLoading(true);
    try {
      if (formData.id) {
        await api.update('devices', formData.id, formData);
      } else {
        const { id, ...data } = formData;
        await api.create('devices', data);
      }
      setModalVisible(false);
      fetchData();
      setFormData({ id: '', type: 'Smartphone', brand: '', model: '', serialNumber: '', customerId: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const performDelete = async () => {
      try {
        await api.remove('devices', id);
        fetchData();
      } catch (error: any) {
        alert(error.message);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Deseja excluir este aparelho?')) performDelete();
    } else {
      Alert.alert('Confirmação', 'Deseja excluir este aparelho?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const filtered = equipment.filter(e => 
    e.model.toLowerCase().includes(search.toLowerCase()) ||
    e.brand.toLowerCase().includes(search.toLowerCase()) ||
    (e.customer && e.customer.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Aparelhos</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setFormData({ id: '', type: 'Smartphone', brand: '', model: '', serialNumber: '', customerId: '' });
            setModalVisible(true);
          }}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Aparelho</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por modelo, marca ou cliente..."
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
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Aparelho</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Marca</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Cliente</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>S/N</Text>
                <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>Ações</Text>
              </View>
            )}

            {filtered.map((item) => (
              isMobile ? (
                <View key={item.id} style={styles.mobileCard}>
                  <View style={styles.mobileCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.type}: {item.model}</Text>
                      <Text style={styles.itemBrand}>{item.brand}</Text>
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
                    <View style={styles.mobileInfoRow}>
                      <User size={14} color={Theme.colors.textSecondary} />
                      <Text style={styles.mobileInfoText}>{item.customer?.name || 'Sem cliente'}</Text>
                    </View>
                    <View style={styles.mobileInfoRow}>
                      <MonitorSmartphone size={14} color={Theme.colors.textSecondary} />
                      <Text style={styles.mobileInfoText}>S/N: {item.serialNumber || 'N/A'}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View key={item.id} style={styles.tableRow}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.itemName}>{item.model}</Text>
                    <Text style={styles.itemType}>{item.type}</Text>
                  </View>
                  <Text style={[styles.itemBrand, { flex: 1 }]}>{item.brand}</Text>
                  <Text style={[styles.itemCustomer, { flex: 1.5 }]}>{item.customer?.name || '-'}</Text>
                  <Text style={[styles.itemSN, { flex: 1 }]}>{item.serialNumber || '-'}</Text>
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
              <Text style={styles.emptyText}>Nenhum aparelho encontrado.</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{formData.id ? 'Editar Aparelho' : 'Novo Aparelho'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Dispositivo</Text>
                <TextInput style={styles.input} value={formData.type} onChangeText={v => setFormData({...formData, type: v})} />
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Marca</Text>
                  <TextInput style={styles.input} value={formData.brand} onChangeText={v => setFormData({...formData, brand: v})} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Modelo</Text>
                  <TextInput style={styles.input} value={formData.model} onChangeText={v => setFormData({...formData, model: v})} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número de Série / IMEI</Text>
                <TextInput style={styles.input} value={formData.serialNumber} onChangeText={v => setFormData({...formData, serialNumber: v})} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cliente Proprietário</Text>
                <View style={styles.selectWrapper}>
                  <select 
                    style={styles.htmlSelect}
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  >
                    <option value="">Selecione um cliente</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
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
  itemName: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  itemType: { fontSize: 12, color: Theme.colors.textSecondary },
  itemBrand: { fontSize: 14, color: Theme.colors.textPrimary },
  itemCustomer: { fontSize: 14, color: Theme.colors.textPrimary },
  itemSN: { fontSize: 13, color: Theme.colors.textSecondary },
  emptyText: { textAlign: 'center', marginTop: Theme.spacing.xl, color: Theme.colors.textSecondary, fontSize: 16 },
  mobileCard: { backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Theme.spacing.sm },
  mobileActions: { flexDirection: 'row', gap: 15 },
  actionIcon: { padding: 4 },
  mobileCardBody: { gap: 6 },
  mobileInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mobileInfoText: { fontSize: 13, color: Theme.colors.textSecondary },
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
