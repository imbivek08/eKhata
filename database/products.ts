import { getDatabase } from './init';
import { NewProduct, Product } from './types';

// Generate simple UUID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get current ISO timestamp
const now = () => new Date().toISOString();

// Get all products for a transaction
export const getProductsByTransaction = async (
  transactionId: string
): Promise<Product[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Product>(
    'SELECT * FROM products WHERE transaction_id = ? ORDER BY created_at ASC',
    [transactionId]
  );
  return result;
};

// Add a product to a transaction
export const addProduct = async (
  transactionId: string,
  product: NewProduct
): Promise<Product> => {
  const db = await getDatabase();
  const id = generateId();
  const timestamp = now();

  await db.runAsync(
    'INSERT INTO products (id, transaction_id, product_name, quantity, amount, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, transactionId, product.product_name, product.quantity || null, product.amount, timestamp]
  );

  const newProduct = await db.getFirstAsync<Product>(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );

  if (!newProduct) {
    throw new Error('Failed to create product');
  }

  return newProduct;
};

// Add multiple products at once
export const addProducts = async (
  transactionId: string,
  products: NewProduct[]
): Promise<Product[]> => {
  const createdProducts: Product[] = [];
  
  for (const product of products) {
    const created = await addProduct(transactionId, product);
    createdProducts.push(created);
  }

  return createdProducts;
};

// Delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM products WHERE id = ?', [productId]);
};

// Calculate total amount from products
export const calculateProductsTotal = (products: NewProduct[]): number => {
  return products.reduce((sum, product) => sum + product.amount, 0);
};
