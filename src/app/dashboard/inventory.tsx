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
import { Search, Plus, X, MoreVertical, AlertTriangle, Package, TrendingDown } from 'lucide-react-native';

// Dados simulados do estoque
const MOCK_INVENTORY = [
  { 
    id: '1', name: 'Tela LCD 15.6" Universal', category: 'Tela',
    qty: 8, minQty: 3, costPrice: 'R$ 180,00', sellPrice: 'R$ 320,00',
    supplier: 'DistribuiTech'
  },
  { 
    id: '2', name: 'Bateria Notebook Dell', category: 'Bateria',
    qty: 2, minQty: 5, costPrice: 'R$ 120,00', sellPrice: 'R$ 220,00',
    supplier: 'NoteCenter'
  },
  { 
    id: '3', name: 'Memória RAM DDR4 8GB', category: 'Memória',
    qty: 15, minQty: 5, costPrice: 'R$ 95,00', sellPrice: 'R$ 160,00',
    supplier: 'DistribuiTech'
  },
  { 
    id: '4', name: 'Toner HP 105A Original', category: 'Toner',
    qty: 1, minQty: 3, costPrice: 'R$ 85,00', sellPrice: 'R$ 150,00',
    supplier: 'HP Brasil'
  },
  { 
    id: '5', name: 'Fusor HP LaserJet Pro', category: 'Peça Impressora',
    qty: 3, minQty: 2, costPrice: 'R$ 280,00', sellPrice: 'R$ 450,00',
    supplier: 'HP Brasil'
  },
  { 
    id: '6', name: 'Pasta Térmica Arctic MX-4', category: 'Insumo',
    qty: 20, minQty: 10, costPrice: 'R$ 35,00', sellPrice: 'R$ 60,00',
    supplier: 'DistribuiTech'
  },
  { 
    id: '7', name: 'SSD 240GB Kingston', category: 'Armazenamento',
    qty: 0, minQty: 4, costPrice: 'R$ 110,00', sellPrice: 'R$ 190,00',
    supplier: 'NoteCenter'
  },
  { 
    id: '8', name: 'Display AMOLED Galaxy S24', category: 'Tela',
    qty: 4, minQty: 2, costPrice: 'R$ 520,00', sellPrice: 'R$ 850,00',
    supplier: 'Samsung Parts'
  },
];

const getStockStatus = (qty: number, minQty: number) => {
  if (qty === 0) return { label: 'Sem estoque', bg: '#F8D7DA', text: '#721C24' };
  if (qty <= minQty) return { label: 'Estoque baixo', bg: '#FFF3CD', text: '#856404' };
  return { label: 'Normal', bg: '#D4EDDA', text: '#155724' };
};

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = MOCK_INVENTORY.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.supplier.toLowerCase().includes(search.toLowerCase())
  );

  // Contadores resumo
  const totalItems = MOCK_INVENTORY.length;
  const lowStock = MOCK_INVENTORY.filter(i => i.qty > 0 && i.qty <= i.minQty).length;
  const outOfStock = MOCK_INVENTORY.filter(i => i.qty === 0).length;

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Estoque de Peças</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Nova Peça</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Resumo */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: Theme.colors.primary }]}>
          <Package size={20} color={Theme.colors.primary} />
          <Text style={styles.summaryValue}>{totalItems}</Text>
          <Text style={styles.summaryLabel}>Itens Cadastrados</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: '#FFC107' }]}>
          <TrendingDown size={20} color="#FFC107" />
          <Text style={styles.summaryValue}>{lowStock}</Text>
          <Text style={styles.summaryLabel}>Estoque Baixo</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: '#DC3545' }]}>
          <AlertTriangle size={20} color="#DC3545" />
          <Text style={styles.summaryValue}>{outOfStock}</Text>
          <Text style={styles.summaryLabel}>Sem Estoque</Text>
        </View>
      </View>

      {/* Card Principal */}
      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome, categoria ou fornecedor..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Cabeçalho da Tabela */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2.5 }]}>Peça / Componente</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Categoria</Text>
          <Text style={[styles.tableHeaderText, { flex: 0.7, textAlign: 'center' }]}>Qtd</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Custo</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Venda</Text>
          <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Status</Text>
          <Text style={[styles.tableHeaderText, { width: 30 }]}></Text>
        </View>

        {/* Linhas da Tabela */}
        <ScrollView style={styles.listContainer}>
          {filtered.map((item) => {
            const stockStatus = getStockStatus(item.qty, item.minQty);
            return (
              <View key={item.id} style={styles.tableRow}>
                <View style={{ flex: 2.5 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.supplierText}>{item.supplier}</Text>
                </View>
                <View style={[styles.categoryBadge, { flex: 1 }]}>
                  <View style={styles.catPill}>
                    <Text style={styles.catPillText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={[styles.qtyText, { flex: 0.7, textAlign: 'center' }, 
                  item.qty === 0 && styles.qtyZero, 
                  item.qty <= item.minQty && item.qty > 0 && styles.qtyLow
                ]}>
                  {item.qty}
                </Text>
                <Text style={[styles.priceText, { flex: 1, textAlign: 'right' }]}>{item.costPrice}</Text>
                <Text style={[styles.priceSellText, { flex: 1, textAlign: 'right' }]}>{item.sellPrice}</Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <View style={[styles.statusBadge, { backgroundColor: stockStatus.bg }]}>
                    <Text style={[styles.statusText, { color: stockStatus.text }]}>
                      {stockStatus.label}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={{ width: 30, alignItems: 'center' }}>
                  <MoreVertical color={Theme.colors.textSecondary} size={18} />
                </TouchableOpacity>
              </View>
            );
          })}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma peça encontrada.</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal Nova Peça */}
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
              <Text style={styles.modalTitle}>Cadastrar Nova Peça</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome da Peça / Componente</Text>
                <TextInput style={styles.input} placeholder="Ex: Tela LCD 15.6 Universal" />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Categoria</Text>
                  <TextInput style={styles.input} placeholder="Ex: Tela, Bateria, Memória" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Fornecedor</Text>
                  <TextInput style={styles.input} placeholder="Nome do fornecedor" />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Quantidade Inicial</Text>
                  <TextInput style={styles.input} placeholder="0" keyboardType="numeric" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Estoque Mínimo</Text>
                  <TextInput style={styles.input} placeholder="3" keyboardType="numeric" />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Preço de Custo</Text>
                  <TextInput style={styles.input} placeholder="R$ 0,00" keyboardType="numeric" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Preço de Venda</Text>
                  <TextInput style={styles.input} placeholder="R$ 0,00" keyboardType="numeric" />
                </View>
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
                <Text style={styles.saveButtonText}>Salvar Peça</Text>
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

  // Cards Resumo
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
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } })
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: { flex: 1 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.inputBackground,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  supplierText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 1,
  },
  categoryBadge: {
    justifyContent: 'center',
  },
  catPill: {
    backgroundColor: Theme.colors.inputBackground,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
  },
  qtyZero: {
    color: '#DC3545',
  },
  qtyLow: {
    color: '#E8A100',
  },
  priceText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  priceSellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
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
