import AddPaymentModal from '@/components/add-payment-modal';
import AddPurchaseModal from '@/components/add-purchase-modal';
import {
  Customer,
  getCustomerById,
  getCustomerTransactionsWithProducts,
  TransactionWithProducts,
} from '@/database';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const customerData = await getCustomerById(id);
      const transactionsData = await getCustomerTransactionsWithProducts(id);
      setCustomer(customerData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const renderTransaction = ({ item }: { item: TransactionWithProducts }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <View style={[
            styles.transactionDot,
            { backgroundColor: item.type === 'purchase' ? '#E11D48' : '#16A34A' }
          ]} />
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            item.type === 'payment' ? styles.paymentAmount : styles.purchaseAmount,
          ]}
        >
          {item.type === 'payment' ? '-' : '+'}₹{item.amount.toFixed(0)}
        </Text>
      </View>

      {item.type === 'purchase' && item.products.length > 0 && (
        <View style={styles.productsContainer}>
          {item.products.map((product) => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.product_name}</Text>
                {product.quantity && (
                  <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
                )}
              </View>
              <Text style={styles.productAmount}>₹{product.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {item.type === 'payment' && (
        <View style={styles.paymentBadge}>
          <MaterialIcons name="check-circle" size={14} color="#16A34A" />
          <Text style={styles.paymentLabel}>Payment Received</Text>
        </View>
      )}

      {item.description && (
        <Text style={styles.transactionDescription}>{item.description}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top']}>
        <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
        <Text style={styles.errorText}>Customer not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Profile & Balance Hero */}
      <View style={styles.balanceCard}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {customer.photo_uri ? (
          <Image source={{ uri: customer.photo_uri }} style={styles.customerPhoto} />
        ) : (
          <View style={styles.customerPhotoPlaceholder}>
            <Text style={styles.customerPhotoPlaceholderText}>{customer.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.customerName}>{customer.name}</Text>
        {customer.phone && <Text style={styles.customerPhone}>{customer.phone}</Text>}
        <Text style={styles.balanceLabel}>Total Pending</Text>
        <Text
          style={[
            styles.balanceAmount,
            customer.total_pending > 0 ? styles.balanceRed : styles.balanceGreen,
          ]}
        >
          ₹{customer.total_pending.toFixed(0)}
        </Text>
      </View>

      <View style={styles.contentArea}>
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={() => setShowPurchaseModal(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
          <Text style={styles.buttonText}>Add Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => setShowPaymentModal(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="payments" size={20} color="#fff" />
          <Text style={styles.buttonText}>Receive Payment</Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>📋 Transaction History</Text>
        <View style={styles.historyCountBadge}>
          <Text style={styles.historyCountText}>{transactions.length}</Text>
        </View>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="receipt-long" size={32} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Record a purchase to get started</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      </View>

      <AddPurchaseModal
        visible={showPurchaseModal}
        customerId={id}
        customerName={customer.name}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseAdded={loadData}
      />

      <AddPaymentModal
        visible={showPaymentModal}
        customerId={id}
        customerName={customer.name}
        totalPending={customer.total_pending}
        onClose={() => setShowPaymentModal(false)}
        onPaymentAdded={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90D9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90D9',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90D9',
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  // ── Profile Hero ──
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
  balanceCard: {
    backgroundColor: '#4A90D9',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  customerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
    marginBottom: 4,
  },
  customerPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  customerPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  customerPhotoPlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 44,
    fontWeight: 'bold',
  },
  balanceRed: {
    color: '#FCA5A5',
  },
  balanceGreen: {
    color: '#86EFAC',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  // ── Action Buttons ──
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  purchaseButton: {
    flex: 1,
    backgroundColor: '#E11D48',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  // ── History ──
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  historyCountBadge: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  historyCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  purchaseAmount: {
    color: '#E11D48',
  },
  paymentAmount: {
    color: '#16A34A',
  },
  productsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  productQuantity: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  productAmount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
  },
  transactionDescription: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    fontStyle: 'italic',
  },
  // ── Empty ──
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 17,
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
