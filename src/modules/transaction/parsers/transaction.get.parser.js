import { serializeTransaction } from './transaction.shape.js';

export const transactionGetParser = (result) => serializeTransaction(result.transaction);
