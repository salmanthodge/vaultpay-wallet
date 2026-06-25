export const transactionDepositConstant = {
  ROUTE: '/wallets/:id/deposit',
  RATE_LIMIT: { key: 'txn:deposit', max: 30, windowSec: 60 },
};
