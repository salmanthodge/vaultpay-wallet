import { serializeTransaction } from './transaction.shape.js';

export const transactionListParser = (result) => result.transactions.map(serializeTransaction);
