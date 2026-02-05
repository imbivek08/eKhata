import { getDatabase } from './init';
import { Customer, NewCustomer } from './types';

// Generate simple UUID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get current ISO timestamp
const now = () => new Date().toISOString();

// Get all customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Customer>('SELECT * FROM customers ORDER BY name ASC');
  return result;
};

// Get customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Customer>(
    'SELECT * FROM customers WHERE id = ?',
    [id]
  );
  return result || null;
};

// Add new customer
export const addCustomer = async (customer: NewCustomer): Promise<Customer> => {
  const db = await getDatabase();
  const id = generateId();
  const timestamp = now();

  await db.runAsync(
    'INSERT INTO customers (id, name, phone, total_pending, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, customer.name, customer.phone || null, 0, timestamp, timestamp]
  );

  const newCustomer = await getCustomerById(id);
  if (!newCustomer) {
    throw new Error('Failed to create customer');
  }
  return newCustomer;
};

// Update customer total pending
export const updateCustomerPending = async (
  customerId: string,
  amount: number
): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE customers SET total_pending = total_pending + ?, updated_at = ? WHERE id = ?',
    [amount, now(), customerId]
  );
};

// Delete customer (and all their transactions via CASCADE)
export const deleteCustomer = async (customerId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM customers WHERE id = ?', [customerId]);
};
