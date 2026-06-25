import { serializeWallet } from './wallet.shape.js';

export const walletGetParser = (result) => serializeWallet(result.wallet);
