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
import { Search, Plus, X, MoreVertical, Monitor, Printer, Laptop, Smartphone } from 'lucide-react-native';

// Ícone baseado no tipo do aparelho
const DeviceIcon = ({ type }: { type: string }) => {
  const iconProps = { size: 28, color: Theme.colors.primary };
  switch (type) {
    case 'notebook': return <Laptop {...iconProps} />;
    case 'impressora': return <Printer {...iconProps} />;
    case 'celular': return <Smartphone {...iconProps} />;
    default: return <Monitor {...iconProps} />;
  }
};

// Dados simulados
const MOCK_DEVICES = [
  { id: '1', type: 'notebook', brand: 'Dell Inspiron 15', serial: 'SN-D3LL-0012', owner: 'João Silva', status: 'Em reparo' },
  { id: '2', type: 'impressora', brand: 'HP LaserJet Pro', serial: 'SN-HP-9987', owner: 'Empresa XPTO Ltda', status: 'Aguardando peça' },
  { id: '3', type: 'desktop', brand: 'Lenovo ThinkCentre', serial: 'SN-LNV-4455', owner: 'Maria Oliveira', status: 'Pronto p/ retirada' },
  { id: '4', type: 'celular', brand: 'Samsung Galaxy S24', serial: 'SN-SS-7821', owner: 'Tech Solutions SA', status: 'Em diagnóstico' },
  { id: '5', type: 'notebook', brand: 'Acer Aspire 5', serial: 'SN-ACR-1133', owner: 'João Silva', status: 'Em reparo' },
];

// Cores do badge de status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em reparo': return { bg: '#FFF3CD', text: '#856404' };
    case 'Aguardando peça': return { bg: '#F8D7DA', text: '#721C24' };
    case 'Pronto p/ retirada': return { bg: '#D4EDDA', text: '#155724' };
    case 'Em diagnóstico': return { bg: '#D1ECF1', text: '#0C5460' };
    default: return { bg: '#E2E3E5', text: '#383D41' };
  }
};

export default function EquipmentScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = MOCK_DEVICES.filter(d =>
    d.brand.toLowerCase().includes(search.toLowerCase()) ||
    d.serial.toLowerCase().includes(search.toLowerCase()) ||
    d.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Gerenciar Aparelhos</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Aparelho</Text>
        </TouchableOpacity>
      </View>

      {/* Card Principal */}
      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por marca, serial ou proprietário..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView style={styles.listContainer}>
          {filtered.map((item) => {
            const statusColor = getStatusColor(item.status);
            return (
              <View key={item.id} style={styles.listItem}>
                <View style={styles.listItemIcon}>
                  <DeviceIcon type={item.type} />
                </View>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemName}>{item.brand}</Text>
                  <Text style={styles.listItemSub}>
                    Serial: {item.serial} • Cliente: {item.owner}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.statusText, { color: statusColor.text }]}>
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
            <Text style={styles.emptyText}>Nenhum aparelho encontrado.</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal de Cadastro de Aparelho */}
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
              <Text style={styles.modalTitle}>Cadastrar Novo Aparelho</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo do Aparelho</Text>
                <View style={styles.typeRow}>
                  {['Desktop', 'Notebook', 'Impressora', 'Celular'].map(t => (
                    <TouchableOpacity key={t} style={styles.typeChip}>
                      <Text style={styles.typeChipText}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Marca / Modelo</Text>
                  <TextInput style={styles.input} placeholder="Ex: Dell Inspiron 15" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Número de Série</Text>
                  <TextInput style={styles.input} placeholder="Ex: SN-D3LL-0012" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cliente (Proprietário)</Text>
                <TextInput style={styles.input} placeholder="Nome do cliente proprietário" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Defeito Relatado</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Descreva o problema relatado pelo cliente..."
                  multiline
                  numberOfLines={4}
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
                <Text style={styles.saveButtonText}>Salvar Aparelho</Text>
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
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Theme.colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  listItemInfo: { flex: 1 },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  listItemSub: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
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
    maxWidth: 600,
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
    height: 100,
    paddingTop: Theme.spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.inputBackground,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
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
