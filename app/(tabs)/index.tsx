import AddCustomerModal from '@/components/add-customer-modal';
import LandingScreen from '@/components/landing-screen';
import { Customer, getAllCustomers } from '@/database';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const loadCustomers = async () => {
    const data = await getAllCustomers();
    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return <LandingScreen onGetStarted={handleGetStarted} />;
  }

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={styles.customerRow}
      onPress={() => router.push(`/customer/${item.id}` as any)}
    >
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        {item.phone && <Text style={styles.customerPhone}>{item.phone}</Text>}
      </View>
      <Text style={[
        styles.customerBalance,
        item.total_pending > 0 ? styles.balanceRed : styles.balanceGray
      ]}>
        ₹{item.total_pending.toFixed(0)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ekhata</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {customers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No customers yet</Text>
          <Text style={styles.emptySubtext}>Tap + to add your first customer</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <AddCustomerModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerAdded={loadCustomers}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  list: {
    padding: 16,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 70,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  customerBalance: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  balanceRed: {
    color: '#FF3B30',
  },
  balanceGray: {
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
