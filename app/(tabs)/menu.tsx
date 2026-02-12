import { getAllCustomers, getArchivedCount } from '@/database';
import { LANGUAGE_LABELS, Language, useI18n } from '@/hooks/use-i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  const { t, lang, setLang } = useI18n();
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const customers = await getAllCustomers();
        setTotalCustomers(customers.length);
        const pending = customers.reduce((sum, c) => sum + c.total_pending, 0);
        setTotalPending(pending);
        const archived = await getArchivedCount();
        setArchivedCount(archived);
      };
      load();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Header */}
      <View style={styles.heroSection}>
        <Text style={styles.title}>{t('menu', 'title')}</Text>
        <Text style={styles.subtitle}>{t('menu', 'subtitle')}</Text>
      </View>

      <View style={styles.contentArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('menu', 'overview')}</Text>
          <View style={styles.overviewCards}>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <MaterialIcons name="people" size={24} color="#2563EB" />
              </View>
              <Text style={styles.overviewValue}>{totalCustomers}</Text>
              <Text style={styles.overviewLabel}>{t('menu', 'customersLabel')}</Text>
            </View>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconCircle, { backgroundColor: '#FECDD3' }]}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#E11D48" />
              </View>
              <Text style={[styles.overviewValue, totalPending > 0 ? { color: '#E11D48' } : {}]}>
                ₹{totalPending.toFixed(0)}
              </Text>
              <Text style={styles.overviewLabel}>{t('menu', 'totalPending')}</Text>
            </View>
          </View>
        </View>

        {/* Archived Customers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('menu', 'customersSection')}</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/archived' as any)}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="archive" size={20} color="#D97706" />
                </View>
                <Text style={styles.menuItemLabel}>{t('menu', 'archivedCustomers')}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {archivedCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{archivedCount}</Text>
                  </View>
                )}
                <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('menu', 'languageSection')}</Text>
          <View style={styles.menuCard}>
            <View style={styles.languageRow}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#E0E7FF' }]}>
                  <MaterialIcons name="translate" size={20} color="#6366F1" />
                </View>
                <Text style={styles.menuItemLabel}>{t('menu', 'language')}</Text>
              </View>
              <View style={styles.languageToggle}>
                {(['en', 'ne'] as Language[]).map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.langBtn,
                      lang === code && styles.langBtnActive,
                    ]}
                    onPress={() => setLang(code)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.langBtnText,
                        lang === code && styles.langBtnTextActive,
                      ]}
                    >
                      {LANGUAGE_LABELS[code]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('menu', 'appSection')}</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(t('menu', 'about') + ' eKhata', t('menu', 'aboutText'))
              }
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <MaterialIcons name="info-outline" size={20} color="#2563EB" />
                </View>
                <Text style={styles.menuItemLabel}>{t('menu', 'about')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(
                  t('menu', 'rateApp'),
                  t('menu', 'rateQuestion'),
                  [
                    { text: t('menu', 'notNow'), style: 'cancel' },
                    { text: t('menu', 'rate'), onPress: () => {} },
                  ]
                )
              }
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="star" size={20} color="#D97706" />
                </View>
                <Text style={styles.menuItemLabel}>{t('menu', 'rateApp')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                Alert.alert(t('menu', 'helpSupport'), t('menu', 'helpText'))
              }
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: '#D1FAE5' }]}>
                  <MaterialIcons name="help-outline" size={20} color="#059669" />
                </View>
                <Text style={styles.menuItemLabel}>{t('menu', 'helpSupport')}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('menu', 'footer')}</Text>
          <Text style={styles.footerSubtext}>{t('menu', 'footerSub')}</Text>
        </View>
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
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#D97706',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
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
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  langBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: '#4A90D9',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  langBtnTextActive: {
    color: '#fff',
  },
});
