import { addTransaction, NewProduct } from '@/database';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface AddPurchaseModalProps {
  visible: boolean;
  customerId: string;
  customerName: string;
  onClose: () => void;
  onPurchaseAdded: () => void;
}

export default function AddPurchaseModal({
  visible,
  customerId,
  customerName,
  onClose,
  onPurchaseAdded,
}: AddPurchaseModalProps) {
  const [products, setProducts] = useState<NewProduct[]>([
    { product_name: '', quantity: '', amount: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  const addProductRow = () => {
    setProducts([...products, { product_name: '', quantity: '', amount: 0 }]);
  };

  const removeProductRow = (index: number) => {
    if (products.length === 1) {
      Alert.alert('Error', 'At least one product is required');
      return;
    }
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const updateProduct = (index: number, field: keyof NewProduct, value: string) => {
    const newProducts = [...products];
    if (field === 'amount') {
      newProducts[index][field] = parseFloat(value) || 0;
    } else {
      newProducts[index][field] = value;
    }
    setProducts(newProducts);
  };

  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + (product.amount || 0), 0);
  };

  const handleSave = async () => {
    const validProducts = products.filter(
      (p) => p.product_name.trim() && p.amount > 0
    );

    if (validProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one product with name and amount');
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        customer_id: customerId,
        type: 'purchase',
        products: validProducts,
      });

      setProducts([{ product_name: '', quantity: '', amount: 0 }]);
      onPurchaseAdded();
      onClose();
    } catch (error) {
      console.error('Error adding purchase:', error);
      Alert.alert('Error', 'Failed to add purchase: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setProducts([{ product_name: '', quantity: '', amount: 0 }]);
    onClose();
  };

  const total = calculateTotal();

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <MaterialIcons name="shopping-cart" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.title}>Add Products</Text>
                <Text style={styles.subtitle}>{customerName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <MaterialIcons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            {/* Product Rows */}
            <View style={styles.sectionHeader}>
              <MaterialIcons name="inventory" size={18} color="#475569" />
              <Text style={styles.sectionTitle}>Products</Text>
            </View>

            {products.map((product, index) => (
              <View key={index} style={styles.productCard}>
                <View style={styles.productNumber}>
                  <Text style={styles.productNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.productInputs}>
                  <TextInput
                    style={[styles.input, styles.productNameInput]}
                    value={product.product_name}
                    onChangeText={(value) => updateProduct(index, 'product_name', value)}
                    placeholder="Product name"
                    placeholderTextColor="#CBD5E1"
                    editable={!saving}
                  />
                  <View style={styles.smallInputRow}>
                    <TextInput
                      style={[styles.input, styles.quantityInput]}
                      value={product.quantity || ''}
                      onChangeText={(value) => updateProduct(index, 'quantity', value)}
                      placeholder="Qty"
                      placeholderTextColor="#CBD5E1"
                      editable={!saving}
                    />
                    <TextInput
                      style={[styles.input, styles.amountInput]}
                      value={product.amount > 0 ? product.amount.toString() : ''}
                      onChangeText={(value) => updateProduct(index, 'amount', value)}
                      placeholder="₹ Amount"
                      placeholderTextColor="#CBD5E1"
                      keyboardType="numeric"
                      editable={!saving}
                    />
                  </View>
                </View>
                {products.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeProductRow(index)}
                  >
                    <MaterialIcons name="delete-outline" size={18} color="#E11D48" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addProductButton}
              onPress={addProductRow}
              disabled={saving}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add-circle-outline" size={20} color="#4A90D9" />
              <Text style={styles.addProductButtonText}>Add Another Product</Text>
            </TouchableOpacity>

            {/* Total */}
            <View style={styles.totalContainer}>
              <View style={styles.totalLeft}>
                <MaterialIcons name="receipt" size={22} color="#E11D48" />
                <Text style={styles.totalLabel}>Total Amount</Text>
              </View>
              <Text style={styles.totalAmount}>₹{total.toFixed(0)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, (saving || total === 0) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || total === 0}
              activeOpacity={0.85}
            >
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Purchase'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    height: '90%',
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  productNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 8,
  },
  productNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  productInputs: {
    flex: 1,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  productNameInput: {
    flex: 1,
  },
  smallInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
  },
  amountInput: {
    flex: 1.5,
    textAlign: 'right',
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 6,
  },
  addProductButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90D9',
    borderRadius: 14,
    marginTop: 6,
    marginBottom: 20,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  addProductButtonText: {
    color: '#4A90D9',
    fontSize: 15,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    marginBottom: 20,
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E11D48',
  },
  saveButton: {
    backgroundColor: '#E11D48',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#E11D48',
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
