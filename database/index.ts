// Export database initialization
export { getDatabase, initDatabase } from './init';

// Export types
export type {
    Customer,
    DaySummary,
    NewCustomer, NewProduct, NewTransaction, PeriodSummary, Product, TopDebtor, Transaction, TransactionWithProducts
} from './types';

// Export types for update
export type { UpdateCustomerData } from './types';

// Export customer operations
export {
    addCustomer,
    archiveCustomer,
    deleteCustomer,
    getAllCustomers,
    getArchivedCount,
    getArchivedCustomers,
    getCustomerById,
    permanentlyDeleteCustomer,
    restoreCustomer,
    updateCustomer,
    updateCustomerPending
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

