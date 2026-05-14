import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Theme } from '../../ui/themes';
import { Search, Plus, X, MoreVertical, ThumbsUp, ThumbsDown, Clock, Trash2 } from 'lucide-react-native';

// Dados simulados de Orçamentos
const MOCK_ESTIMATES = [
  { 
    id: '1', code: 'ORC-0001', client: 'João Silva', device: 'Dell Inspiron 15',
    status: 'Aprovado', total: 'R$ 450,00', date: '11/05/2026',
    items: 'Troca de tela LCD 15.6" + Mão de obra'
  },
  { 
    id: '2', code: 'ORC-0002', client: 'Empresa XPTO Ltda', device: 'HP LaserJet Pro',
    status: 'Pendente', total: 'R$ 780,00', date: '10/05/2026',
    items: 'Fusor novo + Rolo de pressão + Mão de obra'
  },
  { 
    id: '3', code: 'ORC-0003', client: 'Maria Oliveira', device: 'Lenovo ThinkCentre',
    status: 'Rejeitado', total: 'R$ 1.200,00', date: '07/05/2026',
    items: 'Placa mãe + Processador i5 + Memória RAM 16GB'
  },
  { 
    id: '4', code: 'ORC-0004', client: 'Tech Solutions SA', device: 'Samsung Galaxy S24',
    status: 'Pendente', total: 'R$ 950,00', date: '14/05/2026',
    items: 'Display AMOLED original + Mão de obra'
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Aprovado': return { bg: '#D4EDDA', text: '#155724', icon: ThumbsUp };
    case 'Pendente': return { bg: '#FFF3CD', text: '#856404', icon: Clock };
    case 'Rejeitado': return { bg: '#F8D7DA', text: '#721C24', icon: ThumbsDown };
    default: return { bg: '#E2E3E5', text: '#383D41', icon: Clock };
  }
};

export default function EstimatesScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalItems, setModalItems] = useState([
    { desc: '', qty: '1', price: '' }
  ]);

  const filtered = MOCK_ESTIMATES.filter(e =>
    e.code.toLowerCase().includes(search.toLowerCase()) ||
    e.client.toLowerCase().includes(search.toLowerCase()) ||
    e.device.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => {
    setModalItems([...modalItems, { desc: '', qty: '1', price: '' }]);
  };

  const removeItem = (index: number) => {
    if (modalItems.length > 1) {
      setModalItems(modalItems.filter((_, i) => i !== index));
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Orçamentos</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Orçamento</Text>
        </TouchableOpacity>
      </View>

      {/* Card Principal */}
      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por código, cliente ou aparelho..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Listagem */}
        <ScrollView style={styles.listContainer}>
          {filtered.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const StatusIcon = statusStyle.icon;
            return (
              <View key={item.id} style={styles.listItem}>
                {/* Código e Data */}
                <View style={styles.codeColumn}>
                  <Text style={styles.codeText}>{item.code}</Text>
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>

                {/* Info Central */}
                <View style={styles.infoColumn}>
                  <Text style={styles.clientName}>{item.client}</Text>
                  <Text style={styles.deviceName}>{item.device}</Text>
                  <Text style={styles.itemsText} numberOfLines={1}>
                    {item.items}
                  </Text>
                </View>

                {/* Valor */}
                <View style={styles.valueColumn}>
                  <Text style={styles.valueLabel}>Total</Text>
                  <Text style={styles.valueText}>{item.total}</Text>
                </View>

                {/* Status */}
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <StatusIcon size={14} color={statusStyle.text} />
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {item.status}
                  </Text>
                </View>

                <TouchableOpacity style={styles.actionIcon}>
                  <MoreVertical color={Theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>
            );
          })}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>Nenhum orçamento encontrado.</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal Novo Orçamento */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Novo Orçamento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Cliente</Text>
                  <TextInput style={styles.input} placeholder="Selecione o cliente" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Aparelho</Text>
                  <TextInput style={styles.input} placeholder="Selecione o aparelho" />
                </View>
              </View>

              {/* Itens do Orçamento */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Itens / Serviços</Text>
                <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
                  <Plus color={Theme.colors.primary} size={16} />
                  <Text style={styles.addItemText}>Adicionar item</Text>
                </TouchableOpacity>
              </View>

              {modalItems.map((_, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={[styles.inputGroup, { flex: 3, marginRight: Theme.spacing.sm }]}>
                    {index === 0 && <Text style={styles.label}>Descrição</Text>}
                    <TextInput style={styles.input} placeholder="Peça ou serviço" />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                    {index === 0 && <Text style={styles.label}>Qtd</Text>}
                    <TextInput style={styles.input} placeholder="1" keyboardType="numeric" />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1.5, marginRight: Theme.spacing.sm }]}>
                    {index === 0 && <Text style={styles.label}>Valor Unit.</Text>}
                    <TextInput style={styles.input} placeholder="R$ 0,00" keyboardType="numeric" />
                  </View>
                  <TouchableOpacity 
                    style={[styles.removeItemBtn, index === 0 && { marginTop: 22 }]} 
                    onPress={() => removeItem(index)}
                  >
                    <Trash2 color={modalItems.length > 1 ? '#DC3545' : Theme.colors.border} size={18} />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Condições, garantia, prazo de entrega..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Gerar Orçamento</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textInverse,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.accent,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  addButtonText: {
    color: Theme.colors.textInverse,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.xs,
  },
  card: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } })
  },
  listContainer: { flex: 1 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.inputBackground,
  },
  codeColumn: {
    width: 90,
    marginRight: Theme.spacing.md,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '900',
    color: Theme.colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  infoColumn: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  clientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  deviceName: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  itemsText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  valueColumn: {
    width: 100,
    alignItems: 'flex-end',
    marginRight: Theme.spacing.md,
  },
  valueLabel: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '900',
    color: Theme.colors.primary,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginRight: Theme.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionIcon: { padding: 4 },
  emptyText: {
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
    color: Theme.colors.textSecondary,
    fontSize: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  modalForm: { padding: Theme.spacing.lg },
  inputGroup: { marginBottom: Theme.spacing.md },
  inputRow: { flexDirection: 'row' },
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  removeItemBtn: {
    height: 48,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  cancelButton: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    marginRight: Theme.spacing.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.textInverse,
  }
});
