export const transactionWithdrawDocs = {
  '/wallets/{id}/withdraw': {
    post: {
      tags: ['Transactions'],
      summary: 'Debit funds from a wallet (balance-checked, idempotent on reference)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'string', example: '25.50' },
                reference: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Withdrawal recorded; new balance returned' },
        401: { description: 'Missing or invalid access token' },
        404: { description: 'Wallet not found' },
        409: { description: 'Wallet inactive / duplicate reference' },
        422: { description: 'Invalid amount / insufficient funds' },
      },
    },
  },
};
