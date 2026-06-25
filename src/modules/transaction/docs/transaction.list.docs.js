export const transactionListDocs = {
  '/wallets/{id}/transactions': {
    get: {
      tags: ['Transactions'],
      summary: 'List a wallet ledger (paginated)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      ],
      responses: {
        200: { description: 'Array of ledger entries + pagination meta' },
        401: { description: 'Missing or invalid access token' },
        404: { description: 'Wallet not found' },
      },
    },
  },
};
