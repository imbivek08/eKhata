import {
    DaySummary,
    getDailyBreakdown,
    getPeriodSummary,
    getTopDebtors,
    getTotalOutstanding,
    PeriodSummary,
} from '@/database';
import { useI18n } from '@/hooks/use-i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Period = 'week' | 'month';

function getDateRange(period: Period): { start: string; end: string; label: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];

  if (period === 'week') {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as start
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    return { start: monday.toISOString().split('T')[0], end, label: 'This Week' };
  } else {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: firstDay.toISOString().split('T')[0], end, label: 'This Month' };
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function formatAmount(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
}

export default function DashboardScreen() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<Period>('week');
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [dailyData, setDailyData] = useState<DaySummary[]>([]);
  const [topDebtors, setTopDebtors] = useState<
    { id: string; name: string; phone?: string; photo_uri?: string; total_pending: number }[]
  >([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const { start, end } = getDateRange(period);
    const [summaryData, daily, debtors, outstanding] = await Promise.all([
      getPeriodSummary(start, end),
      getDailyBreakdown(start, end),
      getTopDebtors(5),
      getTotalOutstanding(),
    ]);
    setSummary(summaryData);
    setDailyData(daily);
    setTopDebtors(debtors);
    setTotalOutstanding(outstanding);
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Find max daily value for visual bars
  const maxDayValue = dailyData.reduce(
    (max, d) => Math.max(max, d.purchases, d.payments),
    1
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentArea}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          showsVerticalScrollIndicator={false}
        >
        {/* Colored Header */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>{t('dashboard', 'title')}</Text>
          <Text style={styles.subtitle}>
            {period === 'week' ? t('dashboard', 'weeklyOverview') : t('dashboard', 'monthlyOverview')}
          </Text>

          {/* Period Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, period === 'week' && styles.toggleButtonActive]}
              onPress={() => setPeriod('week')}
            >
              <Text style={[styles.toggleText, period === 'week' && styles.toggleTextActive]}>
                {t('dashboard', 'thisWeek')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, period === 'month' && styles.toggleButtonActive]}
              onPress={() => setPeriod('month')}
            >
              <Text style={[styles.toggleText, period === 'month' && styles.toggleTextActive]}>
                {t('dashboard', 'thisMonth')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        {summary && (
          <View style={styles.cardsContainer}>
            <View style={styles.cardRow}>
              <View style={[styles.card, styles.cardPurchase]}>
                <View style={[styles.cardIconCircle, { backgroundColor: '#FECDD3' }]}> 
                  <MaterialIcons name="arrow-upward" size={22} color="#E11D48" />
                </View>
                <Text style={styles.cardLabel}>{t('dashboard', 'creditGiven')}</Text>
                <Text style={[styles.cardAmount, { color: '#E11D48' }]}>
                  ₹{summary.totalPurchases.toFixed(0)}
                </Text>
              </View>
              <View style={[styles.card, styles.cardPayment]}>
                <View style={[styles.cardIconCircle, { backgroundColor: '#BBF7D0' }]}> 
                  <MaterialIcons name="arrow-downward" size={22} color="#16A34A" />
                </View>
                <Text style={styles.cardLabel}>{t('dashboard', 'collected')}</Text>
                <Text style={[styles.cardAmount, { color: '#16A34A' }]}>
                  ₹{summary.totalPayments.toFixed(0)}
                </Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.card, styles.cardNet]}>
                <View style={[styles.cardIconCircle, { backgroundColor: '#BFDBFE' }]}> 
                  <MaterialIcons name="swap-vert" size={22} color="#2563EB" />
                </View>
                <Text style={styles.cardLabel}>{t('dashboard', 'netBalance')}</Text>
                <Text style={[styles.cardAmount, { color: '#2563EB' }]}>
                  ₹{summary.netBalance.toFixed(0)}
                </Text>
              </View>
              <View style={[styles.card, styles.cardOutstanding]}>
                <View style={[styles.cardIconCircle, { backgroundColor: '#FDE68A' }]}> 
                  <MaterialIcons name="account-balance-wallet" size={22} color="#D97706" />
                </View>
                <Text style={styles.cardLabel}>{t('dashboard', 'outstanding')}</Text>
                <Text style={[styles.cardAmount, { color: '#D97706' }]}>
                  ₹{totalOutstanding.toFixed(0)}
                </Text>
              </View>
            </View>
            <View style={styles.transactionCountBadge}>
              <MaterialIcons name="receipt-long" size={14} color="#007AFF" />
              <Text style={styles.transactionCount}>
                {summary.transactionCount} {t('dashboard', 'transactions')}
              </Text>
            </View>
          </View>
        )}

        {/* Daily Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard', 'dailyBreakdown')}</Text>
          </View>
          <View style={styles.sectionCard}>
            {dailyData.length === 0 ? (
              <View style={styles.emptySection}>
                <View style={styles.emptyIconCircle}>
                  <MaterialIcons name="event-note" size={28} color="#CBD5E1" />
                </View>
                <Text style={styles.emptyText}>{t('dashboard', 'noTransactions')}</Text>
                <Text style={styles.emptySubtext}>{t('dashboard', 'transactionsWillShow')}</Text>
              </View>
            ) : (
              dailyData.map((day, idx) => (
                <View key={day.date} style={[styles.dayRow, idx === dailyData.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                  <View style={styles.dayBarsContainer}>
                    {day.purchases > 0 && (
                      <View style={styles.dayBarRow}>
                        <View style={[styles.dayBar, styles.dayBarPurchase, { width: `${Math.max((day.purchases / maxDayValue) * 100, 15)}%` as any }]}>
                          <Text style={styles.dayBarText}>{formatAmount(day.purchases)}</Text>
                        </View>
                      </View>
                    )}
                    {day.payments > 0 && (
                      <View style={styles.dayBarRow}>
                        <View style={[styles.dayBar, styles.dayBarPayment, { width: `${Math.max((day.payments / maxDayValue) * 100, 15)}%` as any }]}>
                          <Text style={styles.dayBarText}>{formatAmount(day.payments)}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
            {dailyData.length > 0 && (
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#E11D48' }]} />
                  <Text style={styles.legendText}>{t('dashboard', 'credit')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
                  <Text style={styles.legendText}>{t('dashboard', 'payment')}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Top Debtors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard', 'topPending')}</Text>
          </View>
          <View style={styles.sectionCard}>
            {topDebtors.length === 0 ? (
              <View style={styles.emptySection}>
                <View style={styles.emptyIconCircle}>
                  <MaterialIcons name="people-outline" size={28} color="#CBD5E1" />
                </View>
                <Text style={styles.emptyText}>{t('dashboard', 'noPending')}</Text>
                <Text style={styles.emptySubtext}>{t('dashboard', 'allClear')}</Text>
              </View>
            ) : (
              topDebtors.map((debtor, index) => {
                const rankColors = ['#F59E0B', '#9CA3AF', '#CD7F32', '#6B7280', '#6B7280'];
                return (
                  <TouchableOpacity
                    key={debtor.id}
                    style={[styles.debtorRow, index === topDebtors.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => router.push(`/customer/${debtor.id}` as any)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.debtorLeft}>
                      <View style={[styles.rankBadge, { backgroundColor: rankColors[index] + '20' }]}>
                        <Text style={[styles.debtorRank, { color: rankColors[index] }]}>
                          {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                        </Text>
                      </View>
                      {debtor.photo_uri ? (
                        <Image source={{ uri: debtor.photo_uri }} style={styles.debtorPhoto} />
                      ) : (
                        <View style={[styles.debtorPhotoPlaceholder, { backgroundColor: rankColors[index] }]}>
                          <Text style={styles.debtorPhotoText}>
                            {debtor.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.debtorName}>{debtor.name}</Text>
                        {debtor.phone && (
                          <Text style={styles.debtorPhone}>{debtor.phone}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.debtorAmountContainer}>
                      <Text style={styles.debtorAmount}>₹{debtor.total_pending.toFixed(0)}</Text>
                      <MaterialIcons name="chevron-right" size={18} color="#ccc" />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90D9',
  },
  scrollView: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  // ── Hero Header ──
  heroSection: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  toggleTextActive: {
    color: '#4A90D9',
  },
  // ── Summary Cards ──
  cardsContainer: {
    paddingHorizontal: 16,
    marginTop: -1,
    paddingTop: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPurchase: {
    backgroundColor: '#FFF1F2',
  },
  cardPayment: {
    backgroundColor: '#F0FDF4',
  },
  cardNet: {
    backgroundColor: '#EFF6FF',
  },
  cardOutstanding: {
    backgroundColor: '#FFFBEB',
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
  },
  transactionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  // ── Sections ──
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // ── Empty States ──
  emptySection: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  // ── Daily Breakdown ──
  dayRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  dayDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  dayBarsContainer: {
    gap: 5,
  },
  dayBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBar: {
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
    minWidth: 60,
  },
  dayBarPurchase: {
    backgroundColor: '#E11D48',
  },
  dayBarPayment: {
    backgroundColor: '#16A34A',
  },
  dayBarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  // ── Top Debtors ──
  debtorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  debtorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtorRank: {
    fontSize: 14,
    fontWeight: '700',
  },
  debtorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  debtorPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debtorPhotoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  debtorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  debtorPhone: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  debtorAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  debtorAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#E11D48',
  },
});
