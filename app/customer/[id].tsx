import AddPaymentModal from '@/components/add-payment-modal';
import AddPurchaseModal from '@/components/add-purchase-modal';
import {
    Customer,
    TransactionWithProducts,
    getCustomerById,
    getCustomerTransactionsWithProducts,
} from '@/database';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
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
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        <Text
          style={[
            styles.transactionAmount,
            item.type === 'payment' ? styles.paymentAmount : styles.purchaseAmount,
          ]}
        >
          {item.type === 'payment' ? '-' : ''}₹{item.amount.toFixed(0)}
        </Text>
      </View>

      {item.type === 'purchase' && item.products.length > 0 && (
        <View style={styles.productsContainer}>
          {item.products.map((product) => (
            <View key={product.id} style={styles.productRow}>
              <Text style={styles.productName}>{product.product_name}</Text>
              <Text style={styles.productAmount}>₹{product.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {item.type === 'payment' && (
        <Text style={styles.paymentLabel}>Payment Received</Text>
      )}

      {item.description && (
        <Text style={styles.transactionDescription}>{item.description}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Customer not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: customer.name,
          headerShown: true,
        }}
      />

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Pending</Text>
        <Text
          style={[
            styles.balanceAmount,
            customer.total_pending > 0 ? styles.balanceRed : styles.balanceGray,
          ]}
        >
          ₹{customer.total_pending.toFixed(0)}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={() => {
            console.log('Add Products button pressed');
            console.log('Customer ID:', id);
            console.log('Customer name:', customer.name);
            setShowPurchaseModal(true);
          }}
        >
          <Text style={styles.buttonText}>Add Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => {
            console.log('Receive Payment button pressed');
            setShowPaymentModal(true);
          }}
        >
          <Text style={styles.buttonText}>Receive Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>History</Text>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Record a purchase to get started</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  balanceCard: {
    backgroundColor: '#f9f9f9',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  balanceRed: {
    color: '#FF3B30',
  },
  balanceGray: {
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  purchaseButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  purchaseAmount: {
    color: '#FF3B30',
  },
  paymentAmount: {
    color: '#34C759',
  },
  productsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  productAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
