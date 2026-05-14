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
  MapPin, Clock, User, CalendarDays, 
  ChevronLeft, ChevronRight, Phone
} from 'lucide-react-native';

// Dias da semana
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Dados simulados de agendamentos
const MOCK_SCHEDULES = [
  { 
    id: '1', client: 'João Silva', phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - Centro',
    service: 'Manutenção preventiva Desktop', technician: 'Carlos Técnico',
    date: '2026-05-14', time: '08:30', duration: '1h30',
    status: 'Confirmado', priority: 'Normal'
  },
  { 
    id: '2', client: 'Empresa XPTO Ltda', phone: '(11) 3333-4444',
    address: 'Av. Paulista, 1500 - 12º andar',
    service: 'Instalação de rede + 5 PCs', technician: 'Ana Técnica',
    date: '2026-05-14', time: '10:00', duration: '3h',
    status: 'Confirmado', priority: 'Alta'
  },
  { 
    id: '3', client: 'Maria Oliveira', phone: '(21) 99999-8888',
    address: 'Rua Lírios, 45 - Jardim América',
    service: 'Troca de tela Notebook', technician: 'Carlos Técnico',
    date: '2026-05-14', time: '14:00', duration: '1h',
    status: 'Pendente', priority: 'Normal'
  },
  { 
    id: '4', client: 'Tech Solutions SA', phone: '(41) 3222-1111',
    address: 'Rua Comércio, 890 - Industrial',
    service: 'Revisão de 3 impressoras', technician: 'Ana Técnica',
    date: '2026-05-15', time: '09:00', duration: '2h',
    status: 'Confirmado', priority: 'Normal'
  },
  { 
    id: '5', client: 'Farmácia Saúde', phone: '(11) 4444-5555',
    address: 'Av. Brasil, 300 - Loja 02',
    service: 'Formatação + Instalação PDV', technician: 'Carlos Técnico',
    date: '2026-05-15', time: '14:00', duration: '2h30',
    status: 'Pendente', priority: 'Alta'
  },
  { 
    id: '6', client: 'João Silva', phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - Centro',
    service: 'Entrega notebook reparado', technician: 'Carlos Técnico',
    date: '2026-05-16', time: '10:00', duration: '30min',
    status: 'Agendado', priority: 'Baixa'
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Confirmado': return { bg: '#D4EDDA', text: '#155724' };
    case 'Pendente': return { bg: '#FFF3CD', text: '#856404' };
    case 'Agendado': return { bg: '#D1ECF1', text: '#0C5460' };
    case 'Cancelado': return { bg: '#F8D7DA', text: '#721C24' };
    case 'Concluído': return { bg: '#E2E3E5', text: '#383D41' };
    default: return { bg: '#E2E3E5', text: '#383D41' };
  }
};

const getPriorityColor = (p: string) => {
  switch (p) {
    case 'Alta': return '#FD7E14';
    case 'Baixa': return '#6C757D';
    default: return Theme.colors.primary;
  }
};

// Gera dias do calendário simples
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
};

export default function ScheduleScreen() {
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(4); // Maio (0-index)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(14);

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  // Filtra agendamentos do dia selecionado
  const daySchedules = MOCK_SCHEDULES.filter(s => s.date === selectedDateStr);

  // Filtra pela pesquisa
  const filtered = daySchedules.filter(s =>
    s.client.toLowerCase().includes(search.toLowerCase()) ||
    s.technician.toLowerCase().includes(search.toLowerCase()) ||
    s.service.toLowerCase().includes(search.toLowerCase())
  );

  // Dias que possuem agendamento
  const scheduledDays = MOCK_SCHEDULES
    .filter(s => s.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`))
    .map(s => parseInt(s.date.split('-')[2]));

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDay(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDay(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Agendamentos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Agendamento</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainRow}>
        {/* Calendário Lateral */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={prevMonth}><ChevronLeft size={22} color={Theme.colors.primary} /></TouchableOpacity>
            <Text style={styles.calendarMonth}>{MONTHS[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={nextMonth}><ChevronRight size={22} color={Theme.colors.primary} /></TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map(d => <Text key={d} style={styles.weekDay}>{d}</Text>)}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, i) => {
              if (day === null) return <View key={`e-${i}`} style={styles.dayCell} />;
              const isSelected = day === selectedDay;
              const hasSchedule = scheduledDays.includes(day);
              return (
                <TouchableOpacity 
                  key={day} 
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day}
                  </Text>
                  {hasSchedule && <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Resumo do Dia */}
          <View style={styles.daySummary}>
            <Text style={styles.daySummaryTitle}>
              {selectedDay} de {MONTHS[currentMonth]}
            </Text>
            <Text style={styles.daySummaryCount}>
              {daySchedules.length} agendamento{daySchedules.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Lista de Agendamentos do Dia */}
        <View style={styles.listCard}>
          <View style={styles.searchBar}>
            <Search color={Theme.colors.textSecondary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar agendamento..."
              placeholderTextColor={Theme.colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView style={styles.listContainer}>
            {filtered.length === 0 ? (
              <View style={styles.emptyContainer}>
                <CalendarDays size={48} color={Theme.colors.border} />
                <Text style={styles.emptyText}>Nenhum agendamento para este dia.</Text>
              </View>
            ) : (
              filtered.map(item => {
                const stStyle = getStatusStyle(item.status);
                return (
                  <View key={item.id} style={styles.scheduleItem}>
                    {/* Faixa lateral de horário */}
                    <View style={[styles.timeLine, { borderLeftColor: getPriorityColor(item.priority) }]}>
                      <Text style={styles.timeText}>{item.time}</Text>
                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>

                    {/* Info Central */}
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleService}>{item.service}</Text>
                      <View style={styles.scheduleRow}>
                        <User size={14} color={Theme.colors.textSecondary} />
                        <Text style={styles.scheduleMeta}>{item.client}</Text>
                        <Phone size={14} color={Theme.colors.textSecondary} />
                        <Text style={styles.scheduleMeta}>{item.phone}</Text>
                      </View>
                      <View style={styles.scheduleRow}>
                        <MapPin size={14} color={Theme.colors.textSecondary} />
                        <Text style={styles.scheduleMeta} numberOfLines={1}>{item.address}</Text>
                      </View>
                      <View style={styles.scheduleRow}>
                        <Clock size={14} color={Theme.colors.textSecondary} />
                        <Text style={styles.scheduleMeta}>Técnico: {item.technician}</Text>
                      </View>
                    </View>

                    {/* Status */}
                    <View style={styles.scheduleActions}>
                      <View style={[styles.statusBadge, { backgroundColor: stStyle.bg }]}>
                        <Text style={[styles.statusText, { color: stStyle.text }]}>{item.status}</Text>
                      </View>
                      <TouchableOpacity><MoreVertical size={18} color={Theme.colors.textSecondary} /></TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>

      {/* Modal Novo Agendamento */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Agendamento</Text>
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
                  <Text style={styles.label}>Telefone de Contato</Text>
                  <TextInput style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Endereço da Visita</Text>
                <TextInput style={styles.input} placeholder="Rua, Número, Bairro, Cidade" />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Data</Text>
                  <TextInput style={styles.input} placeholder="DD/MM/AAAA" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginHorizontal: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Horário</Text>
                  <TextInput style={styles.input} placeholder="HH:MM" />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                  <Text style={styles.label}>Duração Estimada</Text>
                  <TextInput style={styles.input} placeholder="Ex: 1h30" />
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
                    {['Baixa', 'Normal', 'Alta'].map(p => (
                      <TouchableOpacity key={p} style={[styles.priorityChip, { borderColor: getPriorityColor(p) }]}>
                        <Text style={[styles.priorityChipText, { color: getPriorityColor(p) }]}>{p}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição do Serviço</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Descreva o serviço a ser realizado na visita..."
                  multiline numberOfLines={3} textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.saveButtonText}>Agendar Visita</Text>
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

  mainRow: { flex: 1, flexDirection: 'row', gap: Theme.spacing.lg },

  // Calendário
  calendarCard: { width: 300, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, alignSelf: 'flex-start' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.md },
  calendarMonth: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.textPrimary },
  weekRow: { flexDirection: 'row', marginBottom: Theme.spacing.sm },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: Theme.colors.textSecondary },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  dayCellSelected: { backgroundColor: Theme.colors.primary },
  dayText: { fontSize: 14, color: Theme.colors.textPrimary, fontWeight: '500' },
  dayTextSelected: { color: Theme.colors.textInverse, fontWeight: 'bold' },
  dayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Theme.colors.accent, position: 'absolute', bottom: 4 },
  dayDotSelected: { backgroundColor: Theme.colors.textInverse },
  daySummary: { marginTop: Theme.spacing.lg, paddingTop: Theme.spacing.md, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  daySummaryTitle: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textPrimary },
  daySummaryCount: { fontSize: 13, color: Theme.colors.textSecondary, marginTop: 2 },

  // Lista
  listCard: { flex: 1, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.lg, height: 44 },
  searchInput: { flex: 1, marginLeft: Theme.spacing.sm, fontSize: 15, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  listContainer: { flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Theme.spacing.xl * 2 },
  emptyText: { fontSize: 16, color: Theme.colors.textSecondary, marginTop: Theme.spacing.md },

  scheduleItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.inputBackground, gap: Theme.spacing.md },
  timeLine: { borderLeftWidth: 3, paddingLeft: Theme.spacing.sm, paddingVertical: 2 },
  timeText: { fontSize: 18, fontWeight: '900', color: Theme.colors.primary },
  durationText: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },

  scheduleInfo: { flex: 1 },
  scheduleService: { fontSize: 15, fontWeight: 'bold', color: Theme.colors.textPrimary, marginBottom: 6 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  scheduleMeta: { fontSize: 13, color: Theme.colors.textSecondary },

  scheduleActions: { alignItems: 'flex-end', gap: Theme.spacing.sm },
  statusBadge: { paddingHorizontal: Theme.spacing.sm, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Theme.spacing.lg },
  modalContent: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, width: '100%', maxWidth: 700, maxHeight: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.textPrimary },
  modalForm: { padding: Theme.spacing.lg },
  inputGroup: { marginBottom: Theme.spacing.md },
  inputRow: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: Theme.colors.textPrimary, marginBottom: Theme.spacing.xs },
  input: { height: 48, backgroundColor: Theme.colors.inputBackground, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.sm, paddingHorizontal: Theme.spacing.md, fontSize: 16, color: Theme.colors.textPrimary, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  textArea: { height: 80, paddingTop: Theme.spacing.sm },
  priorityRow: { flexDirection: 'row', gap: Theme.spacing.xs, flexWrap: 'wrap' },
  priorityChip: { paddingHorizontal: Theme.spacing.md, paddingVertical: 6, borderRadius: 16, borderWidth: 2, backgroundColor: Theme.colors.inputBackground },
  priorityChipText: { fontSize: 13, fontWeight: 'bold' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: Theme.spacing.lg, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  cancelButton: { paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.sm, marginRight: Theme.spacing.sm },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: Theme.colors.textSecondary },
  saveButton: { backgroundColor: Theme.colors.primary, paddingHorizontal: Theme.spacing.xl, paddingVertical: Theme.spacing.sm, borderRadius: Theme.borderRadius.sm },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textInverse },
});
