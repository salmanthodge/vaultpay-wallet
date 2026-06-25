export const transactionDepositDocs = {
  '/wallets/{id}/deposit': {
    post: {
      tags: ['Transactions'],
      summary: 'Credit funds to a wallet (idempotent on reference)',
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
                amount: { type: 'string', example: '100.00' },
                reference: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Deposit recorded; new balance returned' },
        401: { description: 'Missing or invalid access token' },
        404: { description: 'Wallet not found' },
        409: { description: 'Wallet inactive / duplicate reference' },
        422: { description: 'Invalid amount' },
      },
    },
  },
};
