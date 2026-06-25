import { serializeTransfer } from './transfer.shape.js';

export const transferGetParser = (result) => serializeTransfer(result.transfer);
