import { walletCreateDocs } from './wallet.create.docs.js';
import { walletListDocs } from './wallet.list.docs.js';
import { walletGetDocs } from './wallet.get.docs.js';

/** Merge get + post under the shared /wallets path (rules/07). */
export const walletDocs = {
  '/wallets': { ...walletListDocs['/wallets'], ...walletCreateDocs['/wallets'] },
  '/wallets/{id}': walletGetDocs['/wallets/{id}'],
};
