import { transferCreateDocs } from './transfer.create.docs.js';
import { transferListDocs } from './transfer.list.docs.js';
import { transferGetDocs } from './transfer.get.docs.js';

/** Merge get + post under the shared /transfers path (rules/07). */
export const transferDocs = {
  '/transfers': { ...transferListDocs['/transfers'], ...transferCreateDocs['/transfers'] },
  '/transfers/{id}': transferGetDocs['/transfers/{id}'],
};
