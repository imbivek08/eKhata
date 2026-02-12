import { addTransaction } from '@/database';
import { useI18n } from '@/hooks/use-i18n';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddPaymentModalProps {
  visible: boolean;
  customerId: string;
  customerName: string;
  totalPending: number;
  onClose: () => void;
  onPaymentAdded: () => void;
}

export default function AddPaymentModal({
  visible,
  customerId,
  customerName,
  totalPending,
  onClose,
  onPaymentAdded,
}: AddPaymentModalProps) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFullPayment = () => {
    setAmount(totalPending.toString());
  };

  const handleSave = async () => {
    const paymentAmount = parseFloat(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert(t('common', 'error'), t('addPayment', 'invalidAmount'));
      return;
    }

    if (paymentAmount > totalPending) {
      Alert.alert(
        t('addPayment', 'warningTitle'),
        t('addPayment', 'warningMessage', { payment: paymentAmount.toString(), pending: totalPending.toString() }),
        [
          { text: t('common', 'cancel'), style: 'cancel' },
          { text: t('addPayment', 'continue'), onPress: () => savePayment(paymentAmount) },
        ]
      );
      return;
    }

    await savePayment(paymentAmount);
  };

  const savePayment = async (paymentAmount: number) => {
    setSaving(true);
    try {
      await addTransaction({
        customer_id: customerId,
        type: 'payment',
        amount: paymentAmount,
      });

      setAmount('');
      onPaymentAdded();
      onClose();
    } catch (error) {
      Alert.alert(t('common', 'error'), t('addPayment', 'failedToRecord'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <MaterialIcons name="payments" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.title}>{t('addPayment', 'title')}</Text>
                <Text style={styles.subtitle}>{customerName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <MaterialIcons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Pending Banner */}
            <View style={styles.pendingContainer}>
              <View style={styles.pendingLeft}>
                <View style={styles.pendingIconCircle}>
                  <MaterialIcons name="account-balance-wallet" size={20} color="#E11D48" />
                </View>
                <Text style={styles.pendingLabel}>{t('addPayment', 'totalPending')}</Text>
              </View>
              <Text style={styles.pendingAmount}>₹{totalPending.toFixed(0)}</Text>
            </View>

            {/* Amount Input */}
            <Text style={styles.label}>{t('addPayment', 'amountReceived')}</Text>
            <View style={styles.amountInputWrap}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                keyboardType="numeric"
                autoFocus
                editable={!saving}
              />
            </View>

            {/* Full Payment Shortcut */}
            <TouchableOpacity
              style={styles.fullButton}
              onPress={handleFullPayment}
              disabled={saving}
              activeOpacity={0.7}
            >
              <MaterialIcons name="done-all" size={18} color="#16A34A" />
              <Text style={styles.fullButtonText}>{t('addPayment', 'fullPayment')} (₹{totalPending.toFixed(0)})</Text>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity
              style={[styles.saveButton, (saving || !amount) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || !amount}
              activeOpacity={0.85}
            >
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {saving ? t('common', 'saving') : t('addPayment', 'savePayment')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#4A90D9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 20,
  },
  pendingContainer: {
    backgroundColor: '#FFF1F2',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FECDD3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  pendingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E11D48',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
  },
  rupeeSymbol: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#16A34A',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  fullButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    marginTop: 14,
    backgroundColor: '#F0FDF4',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  fullButtonText: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
