import { serializeTransfer } from './transfer.shape.js';

export const transferListParser = (result) => result.transfers.map(serializeTransfer);
