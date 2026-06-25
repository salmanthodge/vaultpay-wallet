export const transactionListConstant = {
  ROUTE: '/wallets/:id/transactions',
  RATE_LIMIT: { key: 'txn:list', max: 60, windowSec: 60 },
};
