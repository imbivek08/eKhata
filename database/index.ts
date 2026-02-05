// Export database initialization
export { getDatabase, initDatabase } from './init';

// Export types
export type {
    Customer,
    NewCustomer, NewProduct, NewTransaction, Product, Transaction, TransactionWithProducts
} from './types';

// Export customer operations
export {
    addCustomer, deleteCustomer, getAllCustomers,
    getCustomerById, updateCustomerPending
} from './customers';

// Export transaction operations
export {
    addTransaction,
    getCustomerTotalPayments,
    getCustomerTotalPurchases,
    getCustomerTransactions,
    getCustomerTransactionsWithProducts
} from './transactions';

// Export product operations
export {
    addProduct,
    addProducts, calculateProductsTotal, deleteProduct, getProductsByTransaction
} from './products';

