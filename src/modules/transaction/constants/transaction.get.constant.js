export const transactionGetConstant = {
  ROUTE: '/transactions/:id',
  RATE_LIMIT: { key: 'txn:get', max: 60, windowSec: 60 },
};
