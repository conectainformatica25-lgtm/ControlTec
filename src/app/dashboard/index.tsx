import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { Theme } from '../../ui/themes';
import { 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react-native';
import { api } from '../../services/api';

export default function Home() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: 0,
    activeOrders: 0,
    monthlyRevenue: 0,
    pendingEstimates: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data to populate dashboard
        const [customers, orders, finance, estimates] = await Promise.all([
          api.getAll('customers'),
          api.getAll('orders'),
          api.getAll('finance'),
          api.getAll('estimates')
        ]);

        setStats({
          customers: customers.length,
          activeOrders: orders.filter((o: any) => o.status !== 'Concluído').length,
          monthlyRevenue: finance
            .filter((f: any) => f.type === 'receita' && f.status === 'Recebido')
            .reduce((acc: number, f: any) => acc + f.amount, 0),
          pendingEstimates: estimates.filter((e: any) => e.status === 'Pendente').length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const kpis = [
    { title: 'Clientes', value: stats.customers, icon: Users, color: '#4F46E5', label: 'Total cadastrados' },
    { title: 'OS Ativas', value: stats.activeOrders, icon: ClipboardList, color: '#10B981', label: 'Em andamento' },
    { title: 'Receita', value: `R$ ${stats.monthlyRevenue.toFixed(2)}`, icon: TrendingUp, color: '#F59E0B', label: 'Este mês' },
    { title: 'Orçamentos', value: stats.pendingEstimates, icon: AlertCircle, color: '#EF4444', label: 'Aguardando aprovação' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, Bem-vindo!</Text>
          <Text style={styles.dateText}>Confira o resumo da sua assistência técnica hoje.</Text>
        </View>
      </View>

      {/* KPI Cards Grid */}
      <View style={[styles.kpiGrid, isMobile && styles.kpiGridMobile]}>
        {kpis.map((kpi, index) => (
          <View key={index} style={[styles.kpiCard, isMobile && styles.kpiCardMobile]}>
            <View style={[styles.iconContainer, { backgroundColor: kpi.color + '20' }]}>
              <kpi.icon size={24} color={kpi.color} />
            </View>
            <View style={styles.kpiInfo}>
              <Text style={styles.kpiTitle}>{kpi.title}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.mainRow, isMobile && styles.mainRowMobile]}>
        {/* Recent Activity */}
        <View style={[styles.section, styles.activitySection, isMobile && styles.sectionMobile]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
            <TouchableOpacity style={styles.seeAll}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <ArrowRight size={14} color={Theme.colors.accent} />
            </TouchableOpacity>
          </View>

          {[1, 2, 3].map((_, i) => (
            <View key={i} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Clock size={16} color={Theme.colors.textSecondary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityHighlight}>João Silva</Text> aprovou o orçamento <Text style={styles.activityHighlight}>#ORC-2304</Text>
                </Text>
                <Text style={styles.activityTime}>Há 2 horas</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, styles.actionsSection, isMobile && styles.sectionMobile]}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Nova OS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Novo Cliente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }]}>
              <Text style={[styles.actionButtonText, { color: Theme.colors.textPrimary }]}>Lançar Despesa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.textInverse,
  },
  dateText: {
    fontSize: 16,
    color: Theme.colors.textInverse,
    opacity: 0.7,
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  kpiGridMobile: {
    flexDirection: 'column',
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  kpiCardMobile: {
    minWidth: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  kpiInfo: {
    flex: 1,
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Theme.colors.textPrimary,
    marginVertical: 2,
  },
  kpiLabel: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
  },
  mainRow: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
  mainRowMobile: {
    flexDirection: 'column',
  },
  section: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionMobile: {
    minWidth: '100%',
  },
  activitySection: {
    flex: 2,
  },
  actionsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.textPrimary,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.accent,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: Theme.colors.textPrimary,
    lineHeight: 20,
  },
  activityHighlight: {
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  activityTime: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  actionsGrid: {
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  actionButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Theme.colors.textInverse,
    fontWeight: 'bold',
    fontSize: 14,
  }
});
