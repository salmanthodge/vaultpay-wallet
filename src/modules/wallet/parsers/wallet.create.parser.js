import { serializeWallet } from './wallet.shape.js';

export const walletCreateParser = (result) => serializeWallet(result.wallet);
