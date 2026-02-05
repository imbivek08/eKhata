import { addCustomer, Customer, getAllCustomers } from '@/database';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const loadCustomers = async () => {
    const data = await getAllCustomers();
    setCustomers(data);
  };

  const testAddCustomer = async () => {
    await addCustomer({ name: 'Test Customer', phone: '1234567890' });
    await loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ekhata</Text>
      <Text style={styles.subtitle}>Digital Khata for Shop Owners</Text>
      
      <View style={styles.testSection}>
        <Text style={styles.count}>Customers: {customers.length}</Text>
        <Button title="Add Test Customer" onPress={testAddCustomer} />
        
        {customers.map((customer) => (
          <Text key={customer.id} style={styles.customerText}>
            {customer.name} - ₹{customer.total_pending}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  testSection: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  count: {
    fontSize: 18,
    fontWeight: '600',
  },
  customerText: {
    fontSize: 14,
    color: '#333',
  },
});
