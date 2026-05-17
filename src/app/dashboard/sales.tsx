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
import {
  Search,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  TrendingUp,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react-native';
import { api } from '../../services/api';
import { useBreakpoints } from '../../ui/useBreakpoints';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Concluída':   { bg: '#D4EDDA', text: '#155724' },
  'Pendente':    { bg: '#FFF3CD', text: '#856404' },
  'Cancelada':   { bg: '#F8D7DA', text: '#721C24' },
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SalesScreen() {
  const { isCompact, useTableLayout } = useBreakpoints();

  const [search, setSearch] = useState('');
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Itens do carrinho dentro da venda
  const [cartItems, setCartItems] = useState<{ productId: string; name: string; price: number; qty: number }[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    status: 'Concluída',
    notes: '',
    paymentMethod: 'Dinheiro',
    installments: '1',
  });

  // Métodos que suportam parcelamento
  const showInstallments = ['Cartão de Crédito', 'Crédito ao Cliente'].includes(formData.paymentMethod);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, custData, invData] = await Promise.all([
        api.getAll('finance').then((data: any[]) =>
          data.filter((f) => f.category === 'venda')
        ),
        api.getAll('customers'),
        api.getAll('inventory'),
      ]);
      setSales(salesData);
      setCustomers(custData);
      setInventory(invData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price || 0, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartTotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);

  const openModal = () => {
    setCartItems([]);
    setFormData({ customerId: '', status: 'Concluída', notes: '', paymentMethod: 'Dinheiro', installments: '1' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Aviso', 'Adicione ao menos um produto na venda.');
      return;
    }
    setSaveLoading(true);
    try {
      const customer = customers.find((c) => c.id === formData.customerId);
      const installmentLabel = showInstallments && parseInt(formData.installments) > 1
        ? ` ${formData.installments}x de ${formatCurrency(cartTotal / parseInt(formData.installments))}`
        : '';
      const description = `Venda${customer ? ` - ${customer.name}` : ''} (${cartItems.map(i => i.name).join(', ')}) - ${formData.paymentMethod}${installmentLabel}`;

      await api.create('finance', {
        description,
        type: 'receita',
        amount: cartTotal,
        category: 'venda',
        status: formData.status === 'Concluída' ? 'Recebido' : 'Pendente',
      });

      setModalVisible(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const filtered = sales.filter((s) =>
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalVendas = sales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalConcluidas = sales.filter((s) => s.status === 'Recebido').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isCompact && styles.headerCompact]}>
        <Text style={[styles.pageTitle, isCompact && styles.pageTitleBlock]}>Vendas</Text>
        <TouchableOpacity
          style={[styles.addButton, isCompact && styles.addButtonBlock]}
          onPress={openModal}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Nova Venda</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Resumo */}
      <View style={[styles.summaryCards, isCompact && styles.summaryCardsMobile]}>
        <View style={[styles.summaryCard, { borderLeftColor: '#10B981' }]}>
          <ShoppingCart size={20} color="#10B981" style={{ marginBottom: 4 }} />
          <Text style={styles.summaryLabel}>Total de Vendas</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>{formatCurrency(totalVendas)}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Theme.colors.accent }]}>
          <CheckCircle size={20} color={Theme.colors.accent} style={{ marginBottom: 4 }} />
          <Text style={styles.summaryLabel}>Vendas Concluídas</Text>
          <Text style={[styles.summaryValue, { color: Theme.colors.accent }]}>{totalConcluidas}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: '#4F46E5' }]}>
          <Package size={20} color="#4F46E5" style={{ marginBottom: 4 }} />
          <Text style={styles.summaryLabel}>Itens no Estoque</Text>
          <Text style={[styles.summaryValue, { color: '#4F46E5' }]}>{inventory.length}</Text>
        </View>
      </View>

      {/* Lista */}
      <View style={styles.card}>
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar venda..."
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
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Descrição</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Valor</Text>
              </View>
            )}

            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <ShoppingCart size={48} color={Theme.colors.textSecondary} />
                <Text style={styles.emptyText}>Nenhuma venda registrada.</Text>
                <Text style={styles.emptySubText}>Clique em "Nova Venda" para começar.</Text>
              </View>
            ) : filtered.map((item) => (
              !useTableLayout ? (
                <View key={item.id} style={styles.mobileCard}>
                  <View style={styles.mobileCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.description}</Text>
                      <Text style={styles.itemSub}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
                    </View>
                  </View>
                  <View style={styles.mobileCardBody}>
                    <Text style={[styles.priceText, { color: '#10B981' }]}>{formatCurrency(item.amount)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Recebido' ? '#D4EDDA' : '#FFF3CD' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'Recebido' ? '#155724' : '#856404' }]}>
                        {item.status === 'Recebido' ? 'Concluída' : 'Pendente'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View key={item.id} style={styles.tableRow}>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.description}</Text>
                    <Text style={styles.itemSub}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'Recebido' ? '#D4EDDA' : '#FFF3CD', alignSelf: 'flex-start' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'Recebido' ? '#155724' : '#856404' }]}>
                        {item.status === 'Recebido' ? 'Concluída' : 'Pendente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.priceText, { flex: 1, textAlign: 'right', color: '#10B981' }]}>{formatCurrency(item.amount)}</Text>
                </View>
              )
            ))}
          </ScrollView>
        )}
      </View>

      {/* ===== MODAL NOVA VENDA ===== */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Venda</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Cliente */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cliente (opcional)</Text>
                <View style={styles.selectWrapper}>
                  <select
                    style={styles.htmlSelect as any}
                    value={formData.customerId}
                    onChange={(e: any) => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <option value="">Consumidor final</option>
                    {customers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </View>
              </View>

              {/* Forma de Pagamento */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Forma de Pagamento</Text>
                <View style={styles.selectWrapper}>
                  <select
                    style={styles.htmlSelect as any}
                    value={formData.paymentMethod}
                    onChange={(e: any) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="PIX">PIX</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Crédito ao Cliente">Crédito ao Cliente</option>
                  </select>
                </View>
              </View>

              {/* Parcelas — aparece só para Cartão de Crédito e Crédito ao Cliente */}
              {showInstallments && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Número de Parcelas</Text>
                  <View style={styles.installmentsGrid}>
                    {['1','2','3','4','5','6','7','8','9','10','11','12'].map((n) => (
                      <TouchableOpacity
                        key={n}
                        style={[
                          styles.installmentBtn,
                          formData.installments === n && styles.installmentBtnActive
                        ]}
                        onPress={() => setFormData({ ...formData, installments: n })}
                      >
                        <Text style={[
                          styles.installmentBtnText,
                          formData.installments === n && styles.installmentBtnTextActive
                        ]}>{n}x</Text>
                        {cartTotal > 0 && (
                          <Text style={[
                            styles.installmentBtnValue,
                            formData.installments === n && styles.installmentBtnTextActive
                          ]}>
                            {formatCurrency(cartTotal / parseInt(n))}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.selectWrapper}>
                  <select
                    style={styles.htmlSelect as any}
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Concluída">Concluída (Pago)</option>
                    <option value="Pendente">Aguardando Pagamento</option>
                  </select>
                </View>
              </View>

              {/* Produtos do estoque */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adicionar Produtos do Estoque</Text>
                {inventory.length === 0 ? (
                  <Text style={{ color: Theme.colors.textSecondary, fontSize: 13 }}>Nenhum produto no estoque.</Text>
                ) : (
                  <View style={styles.productList}>
                    {inventory.map((prod: any) => (
                      <TouchableOpacity
                        key={prod.id}
                        style={styles.productItem}
                        onPress={() => addToCart(prod)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.productName}>{prod.name}</Text>
                          <Text style={styles.productPrice}>{formatCurrency(prod.price || 0)}</Text>
                        </View>
                        <View style={styles.addProductBtn}>
                          <Plus size={16} color="#FFF" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Carrinho */}
              {cartItems.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Itens da Venda</Text>
                  <View style={styles.cartContainer}>
                    {cartItems.map((item) => (
                      <View key={item.productId} style={styles.cartItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cartItemName}>{item.name}</Text>
                          <Text style={styles.cartItemPrice}>{item.qty}x {formatCurrency(item.price)}</Text>
                        </View>
                        <Text style={styles.cartItemTotal}>{formatCurrency(item.price * item.qty)}</Text>
                        <TouchableOpacity onPress={() => removeFromCart(item.productId)} style={{ marginLeft: 8 }}>
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <View style={styles.cartTotal}>
                      <Text style={styles.cartTotalLabel}>Total</Text>
                      <Text style={styles.cartTotalValue}>{formatCurrency(cartTotal)}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações</Text>
                <TextInput
                  style={[styles.input, { height: 70 }]}
                  multiline
                  value={formData.notes}
                  onChangeText={(v) => setFormData({ ...formData, notes: v })}
                  placeholder="Anotações da venda..."
                  placeholderTextColor={Theme.colors.textSecondary}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saveLoading}>
                {saveLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Registrar {cartItems.length > 0 ? `• ${formatCurrency(cartTotal)}` : ''}
                  </Text>
                )}
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
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.accent, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, borderRadius: Theme.borderRadius.sm, gap: 6 },
  addButtonBlock: { alignSelf: 'stretch', justifyContent: 'center' },
  addButtonText: { color: Theme.colors.textInverse, fontWeight: 'bold' },
  summaryCards: { flexDirection: 'row', flexWrap: 'wrap', gap: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  summaryCardsMobile: { flexDirection: 'column' },
  summaryCard: { flexGrow: 1, flexBasis: 0, minWidth: 160, backgroundColor: Theme.colors.surface, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.md, borderLeftWidth: 5 },
  summaryLabel: { fontSize: 12, color: Theme.colors.textSecondary, textTransform: 'uppercase', fontWeight: 'bold' },
  summaryValue: { fontSize: 20, fontWeight: '900', marginTop: 4, color: Theme.colors.textPrimary },
  card: { flex: 1, minHeight: 0, minWidth: 0, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.lg, height: 44 },
  searchInput: { flex: 1, marginLeft: Theme.spacing.sm, fontSize: 15, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  listContainer: { flex: 1 },
  tableHeader: { flexDirection: 'row', paddingBottom: Theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, marginBottom: Theme.spacing.sm },
  tableHeaderText: { fontSize: 12, fontWeight: 'bold', color: Theme.colors.textSecondary, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.inputBackground },
  mobileCard: { backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, marginBottom: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  mobileCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Theme.spacing.sm },
  mobileCardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  itemSub: { fontSize: 13, color: Theme.colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  priceText: { fontSize: 15, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textPrimary },
  emptySubText: { fontSize: 14, color: Theme.colors.textSecondary },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.lg },
  modalContent: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, width: '100%', maxWidth: 560, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textPrimary },
  modalForm: { padding: Theme.spacing.lg },
  inputGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.xs },
  input: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, fontSize: 16, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  selectWrapper: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm },
  htmlSelect: { width: '100%', height: '100%', border: 'none', background: 'transparent', padding: '0 10px', fontSize: 16, outline: 'none' },
  installmentsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  installmentBtn: { minWidth: 68, paddingVertical: 8, paddingHorizontal: 6, borderRadius: Theme.borderRadius.sm, borderWidth: 1.5, borderColor: Theme.colors.border, backgroundColor: Theme.colors.inputBackground, alignItems: 'center' },
  installmentBtnActive: { borderColor: Theme.colors.accent, backgroundColor: Theme.colors.accent + '18' },
  installmentBtnText: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.textPrimary },
  installmentBtnTextActive: { color: Theme.colors.accent },
  installmentBtnValue: { fontSize: 10, color: Theme.colors.textSecondary, marginTop: 2 },
  productList: { gap: 8 },
  productItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.sm, borderWidth: 1, borderColor: Theme.colors.border },
  productName: { fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary },
  productPrice: { fontSize: 13, color: Theme.colors.textSecondary },
  addProductBtn: { backgroundColor: Theme.colors.accent, borderRadius: 20, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  cartContainer: { backgroundColor: Theme.colors.inputBackground, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border, gap: 8 },
  cartItem: { flexDirection: 'row', alignItems: 'center' },
  cartItemName: { fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary },
  cartItemPrice: { fontSize: 12, color: Theme.colors.textSecondary },
  cartItemTotal: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.textPrimary },
  cartTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Theme.colors.border, marginTop: 4 },
  cartTotalLabel: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textPrimary },
  cartTotalValue: { fontSize: 18, fontWeight: '900', color: '#10B981' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: Theme.spacing.lg, borderTopWidth: 1, borderTopColor: Theme.colors.border, gap: Theme.spacing.md },
  cancelButton: { paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.lg },
  cancelButtonText: { fontSize: 16, color: Theme.colors.textSecondary, fontWeight: '600' },
  saveButton: { backgroundColor: '#10B981', paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.xl, borderRadius: Theme.borderRadius.sm, minWidth: 120, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
