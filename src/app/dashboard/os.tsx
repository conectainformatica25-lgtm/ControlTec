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
import { Search, Plus, X, MoreVertical, Clock, AlertTriangle, CheckCircle, Wrench } from 'lucide-react-native';

// Dados simulados de Ordens de Serviço
const MOCK_ORDERS = [
  { 
    id: '1', os: 'OS-0001', client: 'João Silva', device: 'Dell Inspiron 15',
    technician: 'Carlos Técnico', status: 'Em andamento', priority: 'Alta',
    date: '12/05/2026', description: 'Troca de tela e revisão geral'
  },
  { 
    id: '2', os: 'OS-0002', client: 'Empresa XPTO Ltda', device: 'HP LaserJet Pro',
    technician: 'Ana Técnica', status: 'Aguardando peça', priority: 'Média',
    date: '10/05/2026', description: 'Substituição do fusor e limpeza interna'
  },
  { 
    id: '3', os: 'OS-0003', client: 'Maria Oliveira', device: 'Lenovo ThinkCentre',
    technician: 'Carlos Técnico', status: 'Concluída', priority: 'Baixa',
    date: '08/05/2026', description: 'Formatação e instalação do Windows 11'
  },
  { 
    id: '4', os: 'OS-0004', client: 'Tech Solutions SA', device: 'Samsung Galaxy S24',
    technician: 'Ana Técnica', status: 'Aberta', priority: 'Urgente',
    date: '14/05/2026', description: 'Tela quebrada, não liga'
  },
  { 
    id: '5', os: 'OS-0005', client: 'João Silva', device: 'Acer Aspire 5',
    technician: 'Carlos Técnico', status: 'Em andamento', priority: 'Média',
    date: '13/05/2026', description: 'Troca de bateria e limpeza térmica'
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Aberta': return { bg: '#D1ECF1', text: '#0C5460', icon: Clock };
    case 'Em andamento': return { bg: '#FFF3CD', text: '#856404', icon: Wrench };
    case 'Aguardando peça': return { bg: '#F8D7DA', text: '#721C24', icon: AlertTriangle };
    case 'Concluída': return { bg: '#D4EDDA', text: '#155724', icon: CheckCircle };
    default: return { bg: '#E2E3E5', text: '#383D41', icon: Clock };
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'Urgente': return { bg: '#DC3545', text: '#FFFFFF' };
    case 'Alta': return { bg: '#FD7E14', text: '#FFFFFF' };
    case 'Média': return { bg: Theme.colors.accent, text: '#FFFFFF' };
    case 'Baixa': return { bg: '#6C757D', text: '#FFFFFF' };
    default: return { bg: '#ADB5BD', text: '#FFFFFF' };
  }
};

export default function OrdersScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = MOCK_ORDERS.filter(o =>
    o.os.toLowerCase().includes(search.toLowerCase()) ||
    o.client.toLowerCase().includes(search.toLowerCase()) ||
    o.device.toLowerCase().includes(search.toLowerCase()) ||
    o.technician.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Ordens de Serviço</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Nova OS</Text>
        </TouchableOpacity>
      </View>

      {/* Card Principal */}
      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nº OS, cliente, aparelho ou técnico..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Listagem de OS */}
        <ScrollView style={styles.listContainer}>
          {filtered.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const priorityStyle = getPriorityStyle(item.priority);
            const StatusIcon = statusStyle.icon;
            return (
              <View key={item.id} style={styles.listItem}>
                {/* Coluna Esquerda: Nº OS e Data */}
                <View style={styles.osColumn}>
                  <Text style={styles.osNumber}>{item.os}</Text>
                  <Text style={styles.osDate}>{item.date}</Text>
                </View>

                {/* Coluna Central: Info */}
                <View style={styles.infoColumn}>
                  <Text style={styles.clientName}>{item.client}</Text>
                  <Text style={styles.deviceName}>{item.device}</Text>
                  <Text style={styles.description} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>

                {/* Técnico */}
                <View style={styles.techColumn}>
                  <Text style={styles.techLabel}>Técnico</Text>
                  <Text style={styles.techName}>{item.technician}</Text>
                </View>

                {/* Badges */}
                <View style={styles.badgesColumn}>
                  <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: priorityStyle.text }]}>
                      {item.priority}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <StatusIcon size={14} color={statusStyle.text} />
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.actionIcon}>
                  <MoreVertical color={Theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>
            );
          })}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma ordem de serviço encontrada.</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal Nova OS */}
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
              <Text style={styles.modalTitle}>Abrir Nova Ordem de Serviço</Text>
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

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Técnico Responsável</Text>
                  <TextInput style={styles.input} placeholder="Selecione o técnico" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Prioridade</Text>
                  <View style={styles.priorityRow}>
                    {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => (
                      <TouchableOpacity key={p} style={[
                        styles.priorityChip, 
                        { borderColor: getPriorityStyle(p).bg }
                      ]}>
                        <Text style={[styles.priorityChipText, { color: getPriorityStyle(p).bg }]}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Defeito Relatado pelo Cliente</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Descreva o problema relatado..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações do Técnico</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Observações internas (opcional)..."
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
                <Text style={styles.saveButtonText}>Abrir OS</Text>
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
  osColumn: {
    width: 80,
    marginRight: Theme.spacing.md,
  },
  osNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: Theme.colors.primary,
  },
  osDate: {
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
  description: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  techColumn: {
    width: 120,
    marginRight: Theme.spacing.md,
  },
  techLabel: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  techName: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginTop: 1,
  },
  badgesColumn: {
    alignItems: 'flex-end',
    marginRight: Theme.spacing.sm,
    gap: 6,
  },
  badge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
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
  priorityRow: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
    flexWrap: 'wrap',
  },
  priorityChip: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: Theme.colors.inputBackground,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: 'bold',
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
