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
} from 'react-native';
import { Theme } from '../../ui/themes';
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  X,
  TrendingUp,
  Package,
  CheckCircle,
  ChevronDown,
  Clock,
} from 'lucide-react-native';
import { api } from '../../services/api';
import { useBreakpoints } from '../../ui/useBreakpoints';
import { generateRecibo, generateNotaServico } from '../../services/documentGenerator';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const [cartItems, setCartItems] = useState<{ productId: string; name: string; price: number; qty: number }[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    status: 'Concluída',
    notes: '',
    paymentMethod: 'Dinheiro',
    installments: '1',
    warrantyPeriod: 0,
  });

  const showInstallments = ['Cartão de Crédito', 'Crédito ao Cliente'].includes(formData.paymentMethod);

  const [companyInfo, setCompanyInfo] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, custData, invData, compData] = await Promise.all([
        api.getAll('finance').then((data: any[]) => data.filter((f) => f.category === 'venda')),
        api.getAll('customers'),
        api.getAll('inventory'),
        api.getCompany().catch(() => null),
      ]);
      setSales(salesData);
      setCustomers(custData);
      setInventory(invData);
      if (compData) setCompanyInfo(compData);
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
        return prev.map((i) => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.sellPrice || product.price || 0, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartTotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);

  const openModal = () => {
    setCartItems([]);
    setFormData({ customerId: '', status: 'Concluída', notes: '', paymentMethod: 'Dinheiro', installments: '1', warrantyPeriod: 0 });
    setShowSuccess(false);
    setShowCustomerDropdown(false);
    setShowPaymentDropdown(false);
    setShowStatusDropdown(false);
    setModalVisible(true);
  };

  const handleGenDoc = (type: 'recibo' | 'nota') => {
    if (!lastSale) return;
    const company = { 
      name: companyInfo?.name || 'ControlTec', 
      tradeName: companyInfo?.tradeName || companyInfo?.name || 'ControlTec',
      cnpj: companyInfo?.cnpj || '',
      phone: companyInfo?.phone || '', 
      email: companyInfo?.email || '', 
      address: companyInfo?.address || '',
      logo: companyInfo?.logo || (typeof window !== 'undefined' ? localStorage.getItem('controltec_company_logo') || '' : '')
    };
    const customer = { name: lastSale.clientName };
    const estimate = {
      id: lastSale.id || Date.now().toString(),
      description: lastSale.cartItems.map((i: any) => i.name).join(', '),
      totalValue: lastSale.total,
      status: 'Aprovado',
      items: JSON.stringify(lastSale.cartItems.map((i: any) => ({ name: i.name, qty: i.qty, price: i.price }))),
      notes: lastSale.notes || '',
      createdAt: new Date().toISOString(),
      warrantyPeriod: lastSale.warrantyPeriod,
      paymentMethod: lastSale.paymentMethod,
    };
    if (type === 'recibo') generateRecibo({ estimate, customer, company });
    else generateNotaServico({ estimate, customer, company });
  };

  const handleSave = async () => {
    if (cartItems.length === 0) {
      alert('Adicione ao menos um produto na venda.');
      return;
    }
    setSaveLoading(true);
    try {
      const customer = customers.find((c) => c.id === formData.customerId);
      const clientName = customer ? customer.name : 'Consumidor Final';
      const productNames = cartItems.map(i => i.name).join(', ');
      const numInstallments = showInstallments ? parseInt(formData.installments) : 1;
      const installmentValue = cartTotal / numInstallments;
      const saleId = Date.now().toString();

      if (formData.paymentMethod === 'Crédito ao Cliente' && numInstallments > 1) {
        const today = new Date();
        for (let i = 1; i <= numInstallments; i++) {
          const dueDate = new Date(today);
          dueDate.setMonth(dueDate.getMonth() + i);
          await api.create('finance', {
            desc: `Parcela ${i}/${numInstallments} - ${productNames} - ${clientName}`,
            type: 'receita', value: installmentValue, category: 'parcela', client: clientName, status: 'Pendente',
            notes: JSON.stringify({ saleId, installmentNumber: i, totalInstallments: numInstallments, dueDate: dueDate.toISOString(), paymentMethod: formData.paymentMethod, products: productNames, totalValue: cartTotal }),
          });
        }
      } else {
        const installmentLabel = showInstallments && numInstallments > 1
          ? ` ${numInstallments}x de ${formatCurrency(installmentValue)}` : '';
        await api.create('finance', {
          desc: `Venda${customer ? ` - ${clientName}` : ''} (${productNames}) - ${formData.paymentMethod}${installmentLabel}`,
          type: 'receita', value: cartTotal, category: 'venda', client: clientName,
          status: formData.status === 'Concluída' ? 'Recebido' : 'Pendente',
          notes: formData.notes || null,
        });
      }

      setLastSale({
        id: saleId, clientName,
        paymentMethod: formData.paymentMethod,
        cartItems: [...cartItems],
        total: cartTotal,
        notes: formData.notes,
        warrantyPeriod: formData.warrantyPeriod,
        date: new Date().toLocaleString('pt-BR'),
      });
      setShowSuccess(true);
      fetchData();
    } catch (e: any) {
      alert('Erro ao registrar venda: ' + (e.message || 'Verifique a conexão com o servidor.'));
    } finally {
      setSaveLoading(false);
    }
  };

  const filtered = sales.filter((s) => s.desc?.toLowerCase().includes(search.toLowerCase()));
  const totalVendas = sales.reduce((acc, s) => acc + (s.value || 0), 0);
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
                      <Text style={styles.itemName} numberOfLines={1}>{item.desc || 'Venda'}</Text>
                      <Text style={styles.itemSub}>{item.client}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status === 'Recebido' ? 'Concluída' : 'Pendente']?.bg || '#eee' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[item.status === 'Recebido' ? 'Concluída' : 'Pendente']?.text || '#333' }]}>
                        {item.status === 'Recebido' ? 'Pago' : item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.mobileCardBody}>
                    <Text style={styles.priceText}>{formatCurrency(item.value || 0)}</Text>
                    <Text style={styles.itemSub}>{item.category}</Text>
                  </View>
                </View>
              ) : (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.itemName, { flex: 3 }]} numberOfLines={1}>{item.desc || 'Venda'}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status === 'Recebido' ? 'Concluída' : 'Pendente']?.bg || '#eee' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[item.status === 'Recebido' ? 'Concluída' : 'Pendente']?.text || '#333' }]}>
                        {item.status === 'Recebido' ? 'Pago' : item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.priceText, { flex: 1, textAlign: 'right' }]}>{formatCurrency(item.value || 0)}</Text>
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

            {showSuccess ? (
              // ===== SUCCESS SCREEN =====
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <CheckCircle size={56} color="#10B981" />
                </View>
                <Text style={styles.successTitle}>Venda Finalizada!</Text>
                <Text style={styles.successSubtitle}>
                  {lastSale?.clientName} • {formatCurrency(lastSale?.total || 0)}
                </Text>

                <View style={styles.successActions}>
                  <TouchableOpacity style={styles.docButton} onPress={() => handleGenDoc('recibo')}>
                    <View style={styles.docButtonIcon}>
                      <Text style={{ fontSize: 22 }}>🧾</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docButtonTitle}>Cupom / Recibo</Text>
                      <Text style={styles.docButtonSub}>Gerar recibo para impressão</Text>
                    </View>
                    <ChevronDown size={18} color={Theme.colors.textSecondary} style={{ transform: [{ rotate: '-90deg' }] }} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.docButton} onPress={() => handleGenDoc('nota')}>
                    <View style={styles.docButtonIcon}>
                      <Text style={{ fontSize: 22 }}>📄</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docButtonTitle}>Nota de Serviço PDF</Text>
                      <Text style={styles.docButtonSub}>Gerar nota no padrão ControlTec</Text>
                    </View>
                    <ChevronDown size={18} color={Theme.colors.textSecondary} style={{ transform: [{ rotate: '-90deg' }] }} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveButton, { marginTop: 8, justifyContent: 'center' }]}
                    onPress={() => { setShowSuccess(false); openModal(); }}
                  >
                    <Text style={styles.saveButtonText}>+ Nova Venda</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.cancelButton, { alignItems: 'center' }]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <ScrollView style={styles.modalForm}>
                  {/* Cliente */}
                  <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                    <Text style={styles.label}>Cliente (opcional)</Text>
                    <View style={{ position: 'relative' }}>
                      <TouchableOpacity
                        style={styles.customDropdownButton}
                        onPress={() => { setShowCustomerDropdown(!showCustomerDropdown); setShowPaymentDropdown(false); setShowStatusDropdown(false); }}
                      >
                        <Text style={styles.customDropdownText}>
                          {customers.find((c: any) => c.id === formData.customerId)?.name || 'Consumidor Final'}
                        </Text>
                        <ChevronDown size={20} color="#8E8E93" />
                      </TouchableOpacity>
                      {showCustomerDropdown && (
                        <ScrollView style={styles.customDropdownList} nestedScrollEnabled>
                          <TouchableOpacity style={styles.customDropdownItem} onPress={() => { setFormData({ ...formData, customerId: '' }); setShowCustomerDropdown(false); }}>
                            <Text style={styles.customDropdownItemText}>Consumidor Final</Text>
                          </TouchableOpacity>
                          {customers.map((c: any) => (
                            <TouchableOpacity key={c.id} style={styles.customDropdownItem} onPress={() => { setFormData({ ...formData, customerId: c.id }); setShowCustomerDropdown(false); }}>
                              <Text style={styles.customDropdownItemText}>{c.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  </View>

                  {/* Forma de Pagamento */}
                  <View style={[styles.inputGroup, { zIndex: 999 }]}>
                    <Text style={styles.label}>Forma de Pagamento</Text>
                    <View style={{ position: 'relative' }}>
                      <TouchableOpacity
                        style={styles.customDropdownButton}
                        onPress={() => { setShowPaymentDropdown(!showPaymentDropdown); setShowCustomerDropdown(false); setShowStatusDropdown(false); }}
                      >
                        <Text style={styles.customDropdownText}>{formData.paymentMethod}</Text>
                        <ChevronDown size={20} color="#8E8E93" />
                      </TouchableOpacity>
                      {showPaymentDropdown && (
                        <View style={styles.customDropdownList}>
                          {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Transferência', 'Crédito ao Cliente'].map(method => (
                            <TouchableOpacity key={method} style={styles.customDropdownItem} onPress={() => { setFormData({ ...formData, paymentMethod: method }); setShowPaymentDropdown(false); }}>
                              <Text style={styles.customDropdownItemText}>{method}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Parcelas — aparece só para Cartão de Crédito e Crédito ao Cliente */}
                  {showInstallments && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Número de Parcelas</Text>
                      <View style={styles.installmentsGrid}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((n) => (
                          <TouchableOpacity
                            key={n}
                            style={[styles.installmentBtn, formData.installments === n && styles.installmentBtnActive]}
                            onPress={() => setFormData({ ...formData, installments: n })}
                          >
                            <Text style={[styles.installmentBtnText, formData.installments === n && styles.installmentBtnTextActive]}>{n}x</Text>
                            {cartTotal > 0 && (
                              <Text style={[styles.installmentBtnValue, formData.installments === n && styles.installmentBtnTextActive]}>
                                {formatCurrency(cartTotal / parseInt(n))}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Status */}
                  <View style={[styles.inputGroup, { zIndex: 998 }]}>
                    <Text style={styles.label}>Status</Text>
                    <View style={{ position: 'relative' }}>
                      <TouchableOpacity
                        style={styles.customDropdownButton}
                        onPress={() => { setShowStatusDropdown(!showStatusDropdown); setShowCustomerDropdown(false); setShowPaymentDropdown(false); }}
                      >
                        <Text style={styles.customDropdownText}>
                          {formData.status === 'Concluída' ? 'Concluída (Pago)' : 'Aguardando Pagamento'}
                        </Text>
                        <ChevronDown size={20} color="#8E8E93" />
                      </TouchableOpacity>
                      {showStatusDropdown && (
                        <View style={styles.customDropdownList}>
                          <TouchableOpacity style={styles.customDropdownItem} onPress={() => { setFormData({ ...formData, status: 'Concluída' }); setShowStatusDropdown(false); }}>
                            <Text style={styles.customDropdownItemText}>Concluída (Pago)</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.customDropdownItem} onPress={() => { setFormData({ ...formData, status: 'Pendente' }); setShowStatusDropdown(false); }}>
                            <Text style={styles.customDropdownItemText}>Aguardando Pagamento</Text>
                          </TouchableOpacity>
                        </View>
                      )}
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
                              <Text style={styles.productPrice}>{formatCurrency(prod.sellPrice || prod.price || 0)}</Text>
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

                  {/* Garantia */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Período de Garantia (Meses)</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setFormData({ ...formData, warrantyPeriod: Math.max(0, Number(formData.warrantyPeriod) - 1) })}
                      >
                        <Minus size={20} color={Theme.colors.textPrimary} />
                      </TouchableOpacity>
                      <View style={styles.stepperValueContainer}>
                        <Text style={styles.stepperValue}>{formData.warrantyPeriod}</Text>
                        <Text style={styles.stepperSuffix}>{Number(formData.warrantyPeriod) === 1 ? 'mês' : 'meses'}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => setFormData({ ...formData, warrantyPeriod: Number(formData.warrantyPeriod) + 1 })}
                      >
                        <Plus size={20} color={Theme.colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>

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
                        Finalizar Venda {cartItems.length > 0 ? `• ${formatCurrency(cartTotal)}` : ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  searchInput: { flex: 1, marginLeft: Theme.spacing.sm, fontSize: 15, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' as any } }) },
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
  priceText: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
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
  input: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, fontSize: 16, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' as any } }) },
  installmentsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  installmentBtn: { minWidth: 68, paddingVertical: 8, paddingHorizontal: 6, borderRadius: Theme.borderRadius.sm, borderWidth: 1.5, borderColor: Theme.colors.border, backgroundColor: Theme.colors.inputBackground, alignItems: 'center' },
  installmentBtnActive: { borderColor: Theme.colors.accent, backgroundColor: Theme.colors.accent + '18' },
  installmentBtnValue: { fontSize: 10, color: Theme.colors.textSecondary, marginTop: 2 },
  installmentBtnText: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.textPrimary },
  installmentBtnTextActive: { color: Theme.colors.accent },
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
  saveButton: { backgroundColor: '#10B981', paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.xl, borderRadius: Theme.borderRadius.sm, minWidth: 120, alignItems: 'center', flexDirection: 'row', gap: 4 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  // Custom Dropdown
  customDropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md },
  customDropdownText: { fontSize: 16, color: Theme.colors.textPrimary, flex: 1 },
  customDropdownList: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, maxHeight: 200, zIndex: 9999, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
  customDropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: Theme.colors.inputBackground },
  customDropdownItemText: { fontSize: 15, color: Theme.colors.textPrimary },
  // Stepper
  stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, height: 48, width: 220, alignSelf: 'flex-start' },
  stepperBtn: { paddingHorizontal: 16, height: '100%', justifyContent: 'center', alignItems: 'center' },
  stepperValueContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: Theme.colors.border, height: '100%' },
  stepperValue: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textPrimary, marginRight: 4 },
  stepperSuffix: { fontSize: 14, color: Theme.colors.textSecondary },
  // Success Screen
  successContainer: { padding: 32, alignItems: 'center' },
  successIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#D4F8E8', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.textPrimary, marginBottom: 6 },
  successSubtitle: { fontSize: 15, color: Theme.colors.textSecondary, marginBottom: 24 },
  successActions: { width: '100%', gap: 10 },
  docButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, padding: Theme.spacing.md, gap: 12 },
  docButtonIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: Theme.colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  docButtonTitle: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary },
  docButtonSub: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },
});
