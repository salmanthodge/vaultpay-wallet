import { transactionDepositDocs } from './transaction.deposit.docs.js';
import { transactionWithdrawDocs } from './transaction.withdraw.docs.js';
import { transactionListDocs } from './transaction.list.docs.js';
import { transactionGetDocs } from './transaction.get.docs.js';

export const transactionDocs = {
  ...transactionDepositDocs,
  ...transactionWithdrawDocs,
  ...transactionListDocs,
  ...transactionGetDocs,
};
