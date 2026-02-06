import { Customer, getAllCustomers } from '@/database';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getAllCustomers();
      setCustomers(data);
      setFiltered(data);
    };
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(customers);
    } else {
      const q = query.toLowerCase();
      setFiltered(
        customers.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.phone && c.phone.includes(q))
        )
      );
    }
  }, [query, customers]);

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
          <Text style={styles.customerPhotoPlaceholderText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        {item.phone && <Text style={styles.customerPhone}>{item.phone}</Text>}
      </View>
      <View style={styles.balanceContainer}>
        <Text
          style={[
            styles.customerBalance,
            item.total_pending > 0 ? styles.balanceRed : styles.balanceGreen,
          ]}
        >
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
        <Text style={styles.title}>🔍 Search</Text>
        <Text style={styles.subtitle}>Find customers quickly</Text>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone..."
            placeholderTextColor="#64748B"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialIcons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.contentArea}>
        {query.length > 0 && (
          <View style={styles.resultsBadge}>
            <Text style={styles.resultsText}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons
              name={query ? 'search-off' : 'people-outline'}
              size={36}
              color="#CBD5E1"
            />
          </View>
          <Text style={styles.emptyText}>
            {query ? 'No results found' : 'No customers yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {query ? 'Try a different search term' : 'Add customers from the home screen'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  resultsBadge: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  resultsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  list: {
    padding: 16,
    paddingTop: 12,
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
