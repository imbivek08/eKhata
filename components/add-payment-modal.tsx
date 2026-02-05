import { addTransaction } from '@/database';
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
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFullPayment = () => {
    setAmount(totalPending.toString());
  };

  const handleSave = async () => {
    const paymentAmount = parseFloat(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (paymentAmount > totalPending) {
      Alert.alert(
        'Warning',
        `Payment amount ₹${paymentAmount} is more than pending ₹${totalPending}. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => savePayment(paymentAmount) },
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
      Alert.alert('Error', 'Failed to record payment');
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
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Receive Payment</Text>
              <Text style={styles.subtitle}>{customerName}</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.pendingContainer}>
              <Text style={styles.pendingLabel}>Total Pending:</Text>
              <Text style={styles.pendingAmount}>₹{totalPending.toFixed(0)}</Text>
            </View>

            <Text style={styles.label}>Amount Received</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="₹0"
              keyboardType="numeric"
              autoFocus
              editable={!saving}
            />

            <TouchableOpacity
              style={styles.fullButton}
              onPress={handleFullPayment}
              disabled={saving}
            >
              <Text style={styles.fullButtonText}>Full Payment (₹{totalPending.toFixed(0)})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || !amount}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Payment'}
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  form: {
    padding: 20,
  },
  pendingContainer: {
    backgroundColor: '#FFF3F0',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pendingLabel: {
    fontSize: 16,
    color: '#666',
  },
  pendingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 2,
    borderColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  fullButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34C759',
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: '#F0FFF4',
  },
  fullButtonText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
