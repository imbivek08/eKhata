import { updateCustomerPending } from './customers';
import { getDatabase } from './init';
import { addProducts, calculateProductsTotal, getProductsByTransaction } from './products';
import { NewTransaction, Transaction, TransactionWithProducts } from './types';

// Generate simple UUID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get current ISO timestamp
const now = () => new Date().toISOString();

// Get today's date in YYYY-MM-DD format
const today = () => new Date().toISOString().split('T')[0];

// Get all transactions for a customer
export const getCustomerTransactions = async (
  customerId: string
): Promise<Transaction[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC, created_at DESC',
    [customerId]
  );
  return result;
};

// Get all transactions with their products
export const getCustomerTransactionsWithProducts = async (
  customerId: string
): Promise<TransactionWithProducts[]> => {
  const transactions = await getCustomerTransactions(customerId);
  
  const transactionsWithProducts: TransactionWithProducts[] = [];
  
  for (const transaction of transactions) {
    const products = await getProductsByTransaction(transaction.id);
    transactionsWithProducts.push({
      ...transaction,
      products,
    });
  }
  
  return transactionsWithProducts;
};

// Add new transaction (purchase or payment)
export const addTransaction = async (
  transaction: NewTransaction
): Promise<Transaction> => {
  const db = await getDatabase();
  const id = generateId();
  const timestamp = now();
  const transactionDate = transaction.date || today();

  // Calculate amount from products if provided, otherwise use the provided amount
  let finalAmount = transaction.amount || 0;
  
  if (transaction.products && transaction.products.length > 0) {
    finalAmount = calculateProductsTotal(transaction.products);
  }

  // Start a transaction
  await db.runAsync('BEGIN TRANSACTION');

  try {
    // Insert transaction
    await db.runAsync(
      'INSERT INTO transactions (id, customer_id, type, amount, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        transaction.customer_id,
        transaction.type,
        finalAmount,
        transaction.description || null,
        transactionDate,
        timestamp,
      ]
    );

    // Add products if provided (only for purchases)
    if (transaction.products && transaction.products.length > 0 && transaction.type === 'purchase') {
      await addProducts(id, transaction.products);
    }

    // Update customer's total_pending
    // Purchase adds to pending, payment subtracts from pending
    const pendingChange =
      transaction.type === 'purchase' ? finalAmount : -finalAmount;
    await updateCustomerPending(transaction.customer_id, pendingChange);

    // Commit transaction
    await db.runAsync('COMMIT');

    // Fetch and return the new transaction
    const newTransaction = await db.getFirstAsync<Transaction>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );

    if (!newTransaction) {
      throw new Error('Failed to create transaction');
    }

    return newTransaction;
  } catch (error) {
    // Rollback on error
    await db.runAsync('ROLLBACK');
    throw error;
  }
};

// Get total purchases for a customer
export const getCustomerTotalPurchases = async (
  customerId: string
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE customer_id = ? AND type = 'purchase'",
    [customerId]
  );
  return result?.total || 0;
};

// Get total payments for a customer
export const getCustomerTotalPayments = async (
  customerId: string
): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE customer_id = ? AND type = 'payment'",
    [customerId]
  );
  return result?.total || 0;
};
