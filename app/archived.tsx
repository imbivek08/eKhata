import {
  Customer,
  getArchivedCustomers,
  permanentlyDeleteCustomer,
  restoreCustomer,
} from '@/database';
import { useI18n } from '@/hooks/use-i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ArchivedCustomersScreen() {
  const { t } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadArchived = async () => {
    try {
      const data = await getArchivedCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load archived customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadArchived();
    }, [])
  );

  const handleRestore = (customer: Customer) => {
    Alert.alert(
      t('archived', 'restoreTitle'),
      t('archived', 'restoreMessage', { name: customer.name }),
      [
        { text: t('common', 'cancel'), style: 'cancel' },
        {
          text: t('archived', 'restore'),
          onPress: async () => {
            try {
              await restoreCustomer(customer.id);
              loadArchived();
            } catch (error) {
              Alert.alert(t('common', 'error'), t('archived', 'restoreError'));
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (customer: Customer) => {
    Alert.alert(
      t('archived', 'deleteForeverTitle'),
      t('archived', 'deleteForeverMessage', { name: customer.name }),
      [
        { text: t('common', 'cancel'), style: 'cancel' },
        {
          text: t('archived', 'deleteForever'),
          style: 'destructive',
          onPress: () => {
            // Second confirmation for safety
            Alert.alert(
              t('archived', 'confirmTitle'),
              t('archived', 'confirmMessage', { name: customer.name }),
              [
                { text: t('archived', 'noKeepIt'), style: 'cancel' },
                {
                  text: t('archived', 'yesDelete'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await permanentlyDeleteCustomer(customer.id);
                      loadArchived();
                    } catch (error) {
                      Alert.alert(t('common', 'error'), t('archived', 'deleteError'));
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderCustomer = ({ item }: { item: Customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        {item.photo_uri ? (
          <Image source={{ uri: item.photo_uri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.customerDetails}>
          <Text style={styles.customerName}>{item.name}</Text>
          {item.phone && (
            <Text style={styles.customerPhone}>{item.phone}</Text>
          )}
          <Text style={styles.archivedDate}>
            {t('archived', 'archived')} {item.deleted_at ? formatDate(item.deleted_at) : ''}
          </Text>
          {item.total_pending > 0 && (
            <Text style={styles.pendingAmount}>
              ₹{item.total_pending.toFixed(0)} {t('archived', 'pendingLabel')}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={() => handleRestore(item)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="restore" size={18} color="#16A34A" />
          <Text style={styles.restoreBtnText}>{t('archived', 'restore')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handlePermanentDelete(item)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="delete-forever" size={18} color="#E11D48" />
          <Text style={styles.deleteBtnText}>{t('archived', 'deleteForever')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Hero Header */}
      <View style={styles.heroSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('archived', 'title')}</Text>
        <Text style={styles.subtitle}>
          {t('archived', 'count', { count: customers.length.toString(), label: customers.length === 1 ? t('common', 'customer') : t('common', 'customers') })}
        </Text>
      </View>

      <View style={styles.contentArea}>
        {customers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="inventory-2" size={40} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyText}>{t('archived', 'noArchived')}</Text>
            <Text style={styles.emptySubtext}>
              {t('archived', 'noArchivedDesc')}
            </Text>
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
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  list: {
    padding: 16,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  customerPhone: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  archivedDate: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 3,
    fontWeight: '500',
  },
  pendingAmount: {
    fontSize: 13,
    color: '#E11D48',
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  restoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 10,
  },
  restoreBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 10,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E11D48',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
