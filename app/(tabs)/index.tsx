import { Customer, getAllCustomers } from '@/database';
import { useI18n } from '@/hooks/use-i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const loadCustomers = async () => {
    const data = await getAllCustomers();
    setCustomers(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [])
  );

  const totalPending = customers.reduce((sum, c) => sum + c.total_pending, 0);

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={styles.customerRow}
      onPress={() => router.push(`/customer/${item.id}` as any)}
      activeOpacity={0.7}
    >
      {item.photo_uri ? (
        <Image source={{ uri: item.photo_uri }} style={styles.customerPhoto} />
      ) : (
        <View style={styles.customerPhotoPlaceholder}>
          <Text style={styles.customerPhotoPlaceholderText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        {item.phone && <Text style={styles.customerPhone}>{item.phone}</Text>}
      </View>
      <View style={styles.balanceContainer}>
        <Text style={[
          styles.customerBalance,
          item.total_pending > 0 ? styles.balanceRed : styles.balanceGreen
        ]}>
          ₹{item.total_pending.toFixed(0)}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Header */}
      <View style={styles.heroSection}>
        <Text style={styles.title}>{t('home', 'title')}</Text>
        <Text style={styles.subtitle}>{t('home', 'subtitle')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <MaterialIcons name="people" size={16} color="#93C5FD" />
            <Text style={styles.statText}>{t('home', 'customersCount', { count: customers.length })}</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
            <MaterialIcons name="account-balance-wallet" size={16} color="#FCA5A5" />
            <Text style={[styles.statText, { color: '#FCA5A5' }]}>{t('home', 'pendingAmount', { amount: totalPending.toFixed(0) })}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentArea}>
        {customers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="person-add" size={36} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyText}>{t('home', 'noCustomers')}</Text>
            <Text style={styles.emptySubtext}>{t('home', 'tapToAdd')}</Text>
          </View>
        ) : (
          <FlatList
            data={customers}
            renderItem={renderCustomer}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90D9',
  },
  heroSection: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(59,130,246,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#93C5FD',
  },
  list: {
    padding: 16,
    paddingTop: 16,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  customerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  customerPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerPhotoPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 3,
  },
  customerPhone: {
    fontSize: 13,
    color: '#94A3B8',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerBalance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceRed: {
    color: '#E11D48',
  },
  balanceGreen: {
    color: '#16A34A',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
