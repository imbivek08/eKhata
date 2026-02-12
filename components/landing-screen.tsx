import { useI18n } from '@/hooks/use-i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LandingScreenProps {
  onGetStarted: () => void;
}

export default function LandingScreen({ onGetStarted }: LandingScreenProps) {
  const { t } = useI18n();
  const features = [
    { icon: 'receipt-long' as const, text: t('landing', 'trackPurchases'), color: '#E11D48' },
    { icon: 'payments' as const, text: t('landing', 'recordPayments'), color: '#16A34A' },
    { icon: 'cloud-off' as const, text: t('landing', 'worksOffline'), color: '#2563EB' },
    { icon: 'lock' as const, text: t('landing', 'dataOnDevice'), color: '#D97706' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top wave section */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📒</Text>
        </View>
        <Text style={styles.title}>eKhata</Text>
        <Text style={styles.subtitle}>{t('common', 'tagline')}</Text>
      </View>

      <View style={styles.contentArea}>
        {/* Features */}
        <View style={styles.featuresContainer}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <View style={[styles.featureIconCircle, { backgroundColor: f.color + '18' }]}>
              <MaterialIcons name={f.icon} size={22} color={f.color} />
            </View>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{t('landing', 'getStarted')}</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.footerText}>{t('common', 'simpleSecureOffline')}</Text>
        </View>
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
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  icon: {
    fontSize: 52,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
