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
import { ChevronLeft, ChevronRight, Search, Plus, CalendarDays, User, MapPin, Phone, Clock, X, Edit2 } from 'lucide-react-native';
import { api } from '../../services/api';
import { useBreakpoints } from '../../ui/useBreakpoints';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
};

export default function ScheduleScreen() {
  const { isCompact, useScheduleTwoColumn } = useBreakpoints();
  
  const [search, setSearch] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState(now.getDate());

  const [formData, setFormData] = useState({
    id: '',
    clientName: '',
    clientPhone: '',
    address: '',
    service: '',
    technician: '',
    date: '',
    time: '',
    duration: '',
    status: 'Confirmado',
    priority: 'Normal'
  });

  const fetchData = async () => {
    try {
      const data = await api.getAll('schedules');
      setSchedules(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const handleSave = async () => {
    if (!formData.clientName || !formData.date) return alert('Cliente e Data são obrigatórios');
    try {
      if (formData.id) await api.update('schedules', formData.id, formData);
      else {
        const { id, ...data } = formData;
        await api.create('schedules', data);
      }
      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const filtered = schedules.filter(s => s.date.startsWith(selectedDateStr)).filter(s =>
    s.clientName.toLowerCase().includes(search.toLowerCase()) ||
    s.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isCompact ? styles.headerCompact : undefined]}>
        <Text style={[styles.pageTitle, isCompact ? styles.pageTitleBlock : undefined]}>Agendamentos</Text>
        <TouchableOpacity style={[styles.addButton, isCompact ? styles.addButtonBlock : undefined]} onPress={() => {
          setFormData({ id: '', clientName: '', clientPhone: '', address: '', service: '', technician: '', date: selectedDateStr, time: '', duration: '', status: 'Confirmado', priority: 'Normal' });
          setModalVisible(true);
        }}>
          <Plus color={Theme.colors.textInverse} size={20} />
          <Text style={styles.addButtonText}>Novo Agendamento</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.mainRow, !useScheduleTwoColumn ? styles.mainRowMobile : undefined]}>
        {/* Calendário */}
        <View style={[styles.calendarCard, !useScheduleTwoColumn ? styles.calendarCardStacked : styles.calendarCardInline]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => currentMonth === 0 ? (setCurrentMonth(11), setCurrentYear(currentYear - 1)) : setCurrentMonth(currentMonth - 1)}>
              <ChevronLeft size={22} color={Theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>{MONTHS[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={() => currentMonth === 11 ? (setCurrentMonth(0), setCurrentYear(currentYear + 1)) : setCurrentMonth(currentMonth + 1)}>
              <ChevronRight size={22} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {WEEKDAYS.map(d => <Text key={d} style={styles.weekDay}>{d}</Text>)}
          </View>
          <View style={styles.daysGrid}>
            {calendarDays.map((day, i) => (
              day ? (
                <TouchableOpacity key={day} style={[styles.dayCell, day === selectedDay && styles.dayCellSelected]} onPress={() => setSelectedDay(day)}>
                  <Text style={[styles.dayText, day === selectedDay && styles.dayTextSelected]}>{day}</Text>
                </TouchableOpacity>
              ) : <View key={`e-${i}`} style={styles.dayCell} />
            ))}
          </View>
        </View>

        {/* Lista */}
        <View style={styles.listCard}>
          <View style={styles.searchBar}>
            <Search color={Theme.colors.textSecondary} size={20} />
            <TextInput style={styles.searchInput} placeholder="Pesquisar agendamento..." value={search} onChangeText={setSearch} />
          </View>
          <ScrollView style={styles.listContainer}>
            {filtered.length === 0 ? <Text style={styles.emptyText}>Nenhum agendamento.</Text> : filtered.map(item => (
              <View key={item.id} style={styles.scheduleItem}>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleService}>{item.service}</Text>
                  <Text style={styles.scheduleMeta}><User size={12} /> {item.clientName}</Text>
                  <Text style={styles.scheduleMeta}><Clock size={12} /> {item.time} ({item.duration})</Text>
                </View>
                <TouchableOpacity onPress={() => { setFormData(item); setModalVisible(true); }}><Edit2 size={18} color={Theme.colors.primary} /></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal simples */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agendar Visita</Text>
            <TextInput style={styles.input} placeholder="Cliente" value={formData.clientName} onChangeText={v => setFormData({...formData, clientName: v})} />
            <TextInput style={styles.input} placeholder="Serviço" value={formData.service} onChangeText={v => setFormData({...formData, service: v})} />
            <TextInput style={styles.input} placeholder="Horário (Ex: 14:00)" value={formData.time} onChangeText={v => setFormData({...formData, time: v})} />
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={{color:'#FFF'}}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
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
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.accent, paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.sm, borderRadius: Theme.borderRadius.sm },
  addButtonBlock: { alignSelf: 'stretch', justifyContent: 'center' },
  addButtonText: { color: Theme.colors.textInverse, fontWeight: 'bold', marginLeft: Theme.spacing.xs },
  mainRow: { flexDirection: 'row', gap: Theme.spacing.lg, flex: 1, minHeight: 0, minWidth: 0 },
  mainRowMobile: { flexDirection: 'column' },
  calendarCard: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg },
  calendarCardStacked: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  calendarCardInline: { width: 360, maxWidth: '100%', flexShrink: 0, alignSelf: 'flex-start' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg },
  calendarMonth: { fontSize: 18, fontWeight: 'bold', color: Theme.colors.primary },
  weekRow: { flexDirection: 'row', marginBottom: Theme.spacing.sm },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: Theme.colors.textSecondary },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', height: 45, justifyContent: 'center', alignItems: 'center' },
  dayCellSelected: { backgroundColor: Theme.colors.primary, borderRadius: 22 },
  dayText: { fontSize: 14, color: Theme.colors.textPrimary },
  dayTextSelected: { color: '#FFF', fontWeight: 'bold' },
  listCard: { flex: 1, minHeight: 0, minWidth: 0, backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.inputBackground, paddingHorizontal: Theme.spacing.md, marginBottom: Theme.spacing.lg, height: 44, borderRadius: 8 },
  searchInput: { flex: 1, marginLeft: 8 },
  listContainer: { flex: 1 },
  scheduleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  scheduleInfo: { flex: 1, minWidth: 0, marginRight: Theme.spacing.sm },
  scheduleService: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textPrimary },
  scheduleMeta: { fontSize: 13, color: Theme.colors.textSecondary, marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 20, color: Theme.colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginBottom: 10 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 15 },
  saveButton: { backgroundColor: Theme.colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});
