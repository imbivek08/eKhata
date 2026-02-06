import { getAllCustomers } from '@/database';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    const load = async () => {
      const customers = await getAllCustomers();
      setTotalCustomers(customers.length);
      const pending = customers.reduce((sum, c) => sum + c.total_pending, 0);
      setTotalPending(pending);
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Header */}
      <View style={styles.heroSection}>
        <Text style={styles.title}>⚙️ Menu</Text>
        <Text style={styles.subtitle}>Settings & info</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <MaterialIcons name="people" size={24} color="#2563EB" />
              </View>
              <Text style={styles.overviewValue}>{totalCustomers}</Text>
              <Text style={styles.overviewLabel}>Customers</Text>
            </View>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconCircle, { backgroundColor: '#FECDD3' }]}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#E11D48" />
              </View>
              <Text style={[styles.overviewValue, totalPending > 0 ? { color: '#E11D48' } : {}]}>
                ₹{totalPending.toFixed(0)}
              </Text>
              <Text style={styles.overviewLabel}>Total Pending</Text>
            </View>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert('About eKhata', 'Version 1.0.0\nA simple khata (ledger) app to manage customer accounts.')
              }
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <MaterialIcons name="info-outline" size={20} color="#2563EB" />
                </View>
                <Text style={styles.menuItemLabel}>About</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  'Rate eKhata',
                  'Would you like to rate this app?',
                  [
                    { text: 'Not Now', style: 'cancel' },
                    { text: 'Rate', onPress: () => {} },
                  ]
                )
              }
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="star" size={20} color="#D97706" />
                </View>
                <Text style={styles.menuItemLabel}>Rate App</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert('Help', 'Need help? Contact support@ekhata.app')
              }
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#D1FAE5' }]}>
                  <MaterialIcons name="help-outline" size={20} color="#059669" />
                </View>
                <Text style={styles.menuItemLabel}>Help & Support</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>eKhata v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for local shopkeepers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  heroSection: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  overviewIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  overviewLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
  menuItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#E2E8F0',
  },
});
