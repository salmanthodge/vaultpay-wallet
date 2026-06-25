import { serializeWallet } from './wallet.shape.js';

export const walletListParser = (result) => result.wallets.map(serializeWallet);
