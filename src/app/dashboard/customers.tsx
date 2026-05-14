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
import { Search, Plus, X, MoreVertical, UserCircle } from 'lucide-react-native';

// Dados simulados para a lista de clientes
const MOCK_CUSTOMERS = [
  { id: '1', name: 'João Silva', doc: '123.456.789-00', phone: '(11) 98765-4321', email: 'joao.silva@email.com' },
  { id: '2', name: 'Empresa XPTO Ltda', doc: '12.345.678/0001-90', phone: '(11) 3333-4444', email: 'contato@xpto.com' },
  { id: '3', name: 'Maria Oliveira', doc: '987.654.321-11', phone: '(21) 99999-8888', email: 'maria.oli@email.com' },
  { id: '4', name: 'Tech Solutions SA', doc: '98.765.432/0001-22', phone: '(41) 3222-1111', email: 'financeiro@techs.com' },
];

export default function CustomersScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Filtra os clientes baseados na pesquisa
  const filteredCustomers = MOCK_CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.doc.includes(search)
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho da Página */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Gerenciar Clientes</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Cliente</Text>
        </TouchableOpacity>
      </View>

      {/* Cartão de Conteúdo Principal */}
      <View style={styles.card}>
        {/* Barra de Pesquisa */}
        <View style={styles.searchBar}>
          <Search color={Theme.colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por nome ou documento..."
            placeholderTextColor={Theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Lista de Clientes */}
        <ScrollView style={styles.listContainer}>
          {filteredCustomers.map((item) => (
            <View key={item.id} style={styles.listItem}>
              <View style={styles.listItemAvatar}>
                <UserCircle color={Theme.colors.primary} size={32} />
              </View>
              <View style={styles.listItemInfo}>
                <Text style={styles.listItemName}>{item.name}</Text>
                <Text style={styles.listItemDoc}>{item.doc} • {item.phone}</Text>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIcon}>
                  <MoreVertical color={Theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {filteredCustomers.length === 0 && (
            <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
          )}
        </ScrollView>
      </View>

      {/* Tela Flutuante (Modal) de Cadastro */}
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
              <Text style={styles.modalTitle}>Cadastrar Novo Cliente</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={Theme.colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome ou Razão Social</Text>
                <TextInput style={styles.input} placeholder="Ex: João da Silva" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CPF ou CNPJ</Text>
                <TextInput style={styles.input} placeholder="000.000.000-00" keyboardType="numeric" />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Telefone</Text>
                  <TextInput style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput style={styles.input} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Endereço Completo</Text>
                <TextInput style={styles.input} placeholder="Rua, Número, Bairro, Cidade - UF" />
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
                <Text style={styles.saveButtonText}>Salvar Cliente</Text>
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
    backgroundColor: Theme.colors.background, // Azul do sistema
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
    color: Theme.colors.textInverse, // Branco
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.accent, // Amarelo/Laranja
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
    backgroundColor: Theme.colors.surface, // Branco
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
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.inputBackground,
  },
  listItemAvatar: {
    marginRight: Theme.spacing.md,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
    marginBottom: 2,
  },
  listItemDoc: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.inputBackground,
    marginRight: Theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  actionIcon: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
    color: Theme.colors.textSecondary,
    fontSize: 16,
  },

  // Estilos do Modal
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
  modalForm: {
    padding: Theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
