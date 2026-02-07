import { getDatabase } from './init';
import { Customer, NewCustomer, UpdateCustomerData } from './types';

// Generate simple UUID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Get current ISO timestamp
const now = () => new Date().toISOString();

// Get all active (non-archived) customers
export const getAllCustomers = async (): Promise<Customer[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Customer>(
    'SELECT * FROM customers WHERE deleted_at IS NULL ORDER BY name ASC'
  );
  return result;
};

// Get customer by ID (even if archived — needed for detail page & restore)
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
    'INSERT INTO customers (id, name, phone, photo_uri, total_pending, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, customer.name, customer.phone || null, customer.photo_uri || null, 0, timestamp, timestamp]
  );

  const newCustomer = await getCustomerById(id);
  if (!newCustomer) {
    throw new Error('Failed to create customer');
  }
  return newCustomer;
};

// Update customer details (name, phone, photo)
export const updateCustomer = async (
  customerId: string,
  data: UpdateCustomerData
): Promise<Customer | null> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE customers SET name = ?, phone = ?, photo_uri = ?, updated_at = ? WHERE id = ?',
    [data.name, data.phone || null, data.photo_uri || null, now(), customerId]
  );
  return getCustomerById(customerId);
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

// Soft delete (archive) — hides customer but keeps all data
export const archiveCustomer = async (customerId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE customers SET deleted_at = ?, updated_at = ? WHERE id = ?',
    [now(), now(), customerId]
  );
};

// Restore archived customer
export const restoreCustomer = async (customerId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE customers SET deleted_at = NULL, updated_at = ? WHERE id = ?',
    [now(), customerId]
  );
};

// Get all archived customers
export const getArchivedCustomers = async (): Promise<Customer[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Customer>(
    'SELECT * FROM customers WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC'
  );
  return result;
};

// Get count of archived customers
export const getArchivedCount = async (): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM customers WHERE deleted_at IS NOT NULL'
  );
  return result?.count || 0;
};

// Permanently delete customer and all their transactions (CASCADE)
export const permanentlyDeleteCustomer = async (customerId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM customers WHERE id = ?', [customerId]);
};

// Legacy alias — now does soft delete
export const deleteCustomer = archiveCustomer;
