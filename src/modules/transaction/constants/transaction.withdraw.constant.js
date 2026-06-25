export const transactionWithdrawConstant = {
  ROUTE: '/wallets/:id/withdraw',
  RATE_LIMIT: { key: 'txn:withdraw', max: 30, windowSec: 60 },
};
