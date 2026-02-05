import { addTransaction, NewProduct } from '@/database';
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
    console.log('Starting to save purchase...');
    console.log('Customer ID:', customerId);
    console.log('Products:', products);
    
    // Validate
    const validProducts = products.filter(
      (p) => p.product_name.trim() && p.amount > 0
    );

    console.log('Valid products:', validProducts);

    if (validProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one product with name and amount');
      return;
    }

    setSaving(true);
    try {
      console.log('Calling addTransaction...');
      await addTransaction({
        customer_id: customerId,
        type: 'purchase',
        products: validProducts,
      });

      console.log('Transaction added successfully');
      // Reset form
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

  console.log('AddPurchaseModal render - visible:', visible, 'customerId:', customerId);

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add Products</Text>
              <Text style={styles.subtitle}>{customerName}</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>Products</Text>

            {products.map((product, index) => (
              <View key={index} style={styles.productRow}>
                <View style={styles.productInputs}>
                  <TextInput
                    style={[styles.input, styles.productNameInput]}
                    value={product.product_name}
                    onChangeText={(value) => updateProduct(index, 'product_name', value)}
                    placeholder="Product name"
                    editable={!saving}
                  />
                  <TextInput
                    style={[styles.input, styles.quantityInput]}
                    value={product.quantity || ''}
                    onChangeText={(value) => updateProduct(index, 'quantity', value)}
                    placeholder="Qty"
                    editable={!saving}
                  />
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    value={product.amount > 0 ? product.amount.toString() : ''}
                    onChangeText={(value) => updateProduct(index, 'amount', value)}
                    placeholder="₹0"
                    keyboardType="numeric"
                    editable={!saving}
                  />
                </View>
                {products.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeProductRow(index)}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addProductButton}
              onPress={addProductRow}
              disabled={saving}
            >
              <Text style={styles.addProductButtonText}>+ Add Another Product</Text>
            </TouchableOpacity>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₹{total.toFixed(0)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving || total === 0}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save'}
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
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
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  productNameInput: {
    flex: 2,
  },
  quantityInput: {
    flex: 1,
  },
  amountInput: {
    flex: 1,
    textAlign: 'right',
  },
  removeButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addProductButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#F0F8FF',
  },
  addProductButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
