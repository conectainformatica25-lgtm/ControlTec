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
import { 
  Search, Plus, X, MoreVertical, 
  TrendingUp, TrendingDown, DollarSign, 
  ArrowUpCircle, ArrowDownCircle, Filter
} from 'lucide-react-native';

// Dados simulados
const MOCK_TRANSACTIONS = [
  { id: '1', desc: 'OS-0001 - Troca de tela Dell', type: 'receita', value: 'R$ 450,00', rawValue: 450, date: '14/05/2026', category: 'Ordem de Serviço', status: 'Recebido', client: 'João Silva' },
  { id: '2', desc: 'Compra de peças - DistribuiTech', type: 'despesa', value: 'R$ 1.200,00', rawValue: 1200, date: '13/05/2026', category: 'Fornecedor', status: 'Pago', client: 'DistribuiTech' },
  { id: '3', desc: 'OS-0003 - Formatação Lenovo', type: 'receita', value: 'R$ 200,00', rawValue: 200, date: '12/05/2026', category: 'Ordem de Serviço', status: 'Recebido', client: 'Maria Oliveira' },
  { id: '4', desc: 'Aluguel do espaço', type: 'despesa', value: 'R$ 800,00', rawValue: 800, date: '10/05/2026', category: 'Despesa Fixa', status: 'Pago', client: '-' },
  { id: '5', desc: 'ORC-0002 - Orçamento HP LaserJet', type: 'receita', value: 'R$ 780,00', rawValue: 780, date: '10/05/2026', category: 'Orçamento', status: 'Pendente', client: 'Empresa XPTO Ltda' },
  { id: '6', desc: 'OS-0005 - Troca bateria Acer', type: 'receita', value: 'R$ 320,00', rawValue: 320, date: '09/05/2026', category: 'Ordem de Serviço', status: 'Recebido', client: 'João Silva' },
  { id: '7', desc: 'Conta de energia', type: 'despesa', value: 'R$ 350,00', rawValue: 350, date: '05/05/2026', category: 'Despesa Fixa', status: 'Pago', client: '-' },
  { id: '8', desc: 'ORC-0004 - Display Samsung', type: 'receita', value: 'R$ 950,00', rawValue: 950, date: '14/05/2026', category: 'Orçamento', status: 'Pendente', client: 'Tech Solutions SA' },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Recebido': return { bg: '#D4EDDA', text: '#155724' };
    case 'Pago': return { bg: '#D4EDDA', text: '#155724' };
    case 'Pendente': return { bg: '#FFF3CD', text: '#856404' };
    case 'Atrasado': return { bg: '#F8D7DA', text: '#721C24' };
    default: return { bg: '#E2E3E5', text: '#383D41' };
  }
};

export default function FinanceScreen() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'receita' | 'despesa'>('receita');

  const filtered = MOCK_TRANSACTIONS.filter(t => {
    const matchSearch = t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.client.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'todos' || t.type === filterType;
    return matchSearch && matchType;
  });

  // Cálculos
  const totalReceitas = MOCK_TRANSACTIONS
    .filter(t => t.type === 'receita' && t.status === 'Recebido')
    .reduce((s, t) => s + t.rawValue, 0);
  const totalDespesas = MOCK_TRANSACTIONS
    .filter(t => t.type === 'despesa' && t.status === 'Pago')
    .reduce((s, t) => s + t.rawValue, 0);
  const totalPendente = MOCK_TRANSACTIONS
    .filter(t => t.status === 'Pendente')
    .reduce((s, t) => s + t.rawValue, 0);
  const saldo = totalReceitas - totalDespesas;

  const openModal = (type: 'receita' | 'despesa') => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Financeiro</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: '#28A745' }]} 
            onPress={() => openModal('receita')}
          >
            <ArrowUpCircle color="#FFF" size={18} />
            <Text style={styles.addButtonText}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: '#DC3545' }]} 
            onPress={() => openModal('despesa')}
          >
            <ArrowDownCircle color="#FFF" size={18} />
            <Text style={styles.addButtonText}>Despesa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards Resumo */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: '#28A745' }]}>
          <TrendingUp size={22} color="#28A745" />
          <View>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, { color: '#28A745' }]}>
              R$ {totalReceitas.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: '#DC3545' }]}>
          <TrendingDown size={22} color="#DC3545" />
          <View>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, { color: '#DC3545' }]}>
              R$ {totalDespesas.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Theme.colors.primary }]}>
          <DollarSign size={22} color={Theme.colors.primary} />
          <View>
            <Text style={styles.summaryLabel}>Saldo</Text>
            <Text style={[styles.summaryValue, { color: saldo >= 0 ? '#28A745' : '#DC3545' }]}>
              R$ {saldo.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Theme.colors.accent }]}>
          <Filter size={22} color={Theme.colors.accent} />
          <View>
            <Text style={styles.summaryLabel}>Pendente</Text>
            <Text style={[styles.summaryValue, { color: Theme.colors.accent }]}>
              R$ {totalPendente.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Principal */}
      <View style={styles.card}>
        {/* Barra de Pesquisa + Filtros */}
        <View style={styles.filterRow}>
          <View style={styles.searchBar}>
            <Search color={Theme.colors.textSecondary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar lançamento..."
              placeholderTextColor={Theme.colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.filterButtons}>
            {(['todos', 'receita', 'despesa'] as const).map(f => (
              <TouchableOpacity 
                key={f} 
                style={[styles.filterChip, filterType === f && styles.filterChipActive]}
                onPress={() => setFilterType(f)}
              >
                <Text style={[styles.filterChipText, filterType === f && styles.filterChipTextActive]}>
                  {f === 'todos' ? 'Todos' : f === 'receita' ? 'Receitas' : 'Despesas'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Listagem */}
        <ScrollView style={styles.listContainer}>
          {filtered.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            const isReceita = item.type === 'receita';
            return (
              <View key={item.id} style={styles.listItem}>
                {/* Ícone tipo */}
                <View style={[styles.typeIcon, { backgroundColor: isReceita ? '#D4EDDA' : '#F8D7DA' }]}>
                  {isReceita
                    ? <ArrowUpCircle size={22} color="#28A745" />
                    : <ArrowDownCircle size={22} color="#DC3545" />
                  }
                </View>

                {/* Info */}
                <View style={styles.infoColumn}>
                  <Text style={styles.descText}>{item.desc}</Text>
                  <Text style={styles.metaText}>
                    {item.category} • {item.client}
                  </Text>
                </View>

                {/* Data */}
                <Text style={styles.dateText}>{item.date}</Text>

                {/* Valor */}
                <Text style={[styles.valueText, { color: isReceita ? '#28A745' : '#DC3545' }]}>
                  {isReceita ? '+' : '-'} {item.value}
                </Text>

                {/* Status */}
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {item.status}
                  </Text>
                </View>

                <TouchableOpacity style={styles.actionIcon}>
                  <MoreVertical color={Theme.colors.textSecondary} size={18} />
                </TouchableOpacity>
              </View>
            );
          })}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>Nenhum lançamento encontrado.</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal Novo Lançamento */}
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
            <View style={[styles.modalHeader, { 
              borderBottomColor: modalType === 'receita' ? '#28A745' : '#DC3545' 
            }]}>
              <Text style={styles.modalTitle}>
                {modalType === 'receita' ? 'Nova Receita' : 'Nova Despesa'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder={modalType === 'receita' 
                    ? 'Ex: Pagamento OS-0001' 
                    : 'Ex: Compra de peças'
                  } 
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Valor (R$)</Text>
                  <TextInput style={styles.input} placeholder="R$ 0,00" keyboardType="numeric" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Data</Text>
                  <TextInput style={styles.input} placeholder="DD/MM/AAAA" />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Categoria</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder={modalType === 'receita' 
                      ? 'OS, Orçamento, Outros' 
                      : 'Fornecedor, Fixa, Outros'
                    } 
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>
                    {modalType === 'receita' ? 'Cliente' : 'Fornecedor / Destinatário'}
                  </Text>
                  <TextInput style={styles.input} placeholder="Nome" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Informações adicionais..."
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
                style={[styles.saveButton, { 
                  backgroundColor: modalType === 'receita' ? '#28A745' : '#DC3545' 
                }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>
                  {modalType === 'receita' ? 'Registrar Receita' : 'Registrar Despesa'}
                </Text>
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
    marginBottom: Theme.spacing.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.textInverse,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    gap: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Resumo
  summaryRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.md,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 1,
  },

  // Card tabela
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } })
  },
  filterButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.inputBackground,
  },
  filterChipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: Theme.colors.textInverse,
  },
  listContainer: { flex: 1 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.inputBackground,
    gap: Theme.spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoColumn: { flex: 1 },
  descText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  metaText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    width: 80,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 15,
    fontWeight: '900',
    width: 120,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
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
    borderBottomWidth: 2,
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
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  }
});
