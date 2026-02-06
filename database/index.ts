// Export database initialization
export { getDatabase, initDatabase } from './init';

// Export types
export type {
    Customer,
    DaySummary,
    NewCustomer, NewProduct, NewTransaction, PeriodSummary, Product, TopDebtor, Transaction, TransactionWithProducts
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
    getCustomerTransactionsWithProducts,
    getDailyBreakdown,
    getPeriodSummary,
    getTopDebtors,
    getTotalOutstanding
} from './transactions';

// Export product operations
export {
    addProduct,
    addProducts, calculateProductsTotal, deleteProduct, getProductsByTransaction
} from './products';

