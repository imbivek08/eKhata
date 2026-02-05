export interface Customer {
  id: string;
  name: string;
  phone?: string;
  photo_uri?: string;
  total_pending: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  customer_id: string;
  type: 'purchase' | 'payment';
  amount: number;
  description?: string;
  date: string;
  created_at: string;
}

export interface Product {
  id: string;
  transaction_id: string;
  product_name: string;
  quantity?: string;
  amount: number;
  created_at: string;
}

export interface NewCustomer {
  name: string;
  phone?: string;
  photo_uri?: string;
}

export interface NewTransaction {
  customer_id: string;
  type: 'purchase' | 'payment';
  amount?: number; // Optional - will be calculated from products if not provided
  description?: string;
  date?: string; // Optional, defaults to today
  products?: NewProduct[]; // Optional - products for this transaction
}

export interface NewProduct {
  product_name: string;
  quantity?: string;
  amount: number;
}

export interface TransactionWithProducts extends Transaction {
  products: Product[];
}
