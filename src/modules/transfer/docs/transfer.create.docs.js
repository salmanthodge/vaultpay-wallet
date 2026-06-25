export const transferCreateDocs = {
  '/transfers': {
    post: {
      tags: ['Transfers'],
      summary: 'Transfer funds between two wallets (atomic, idempotent on reference)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['fromWalletId', 'toWalletId', 'amount'],
              properties: {
                fromWalletId: { type: 'string', format: 'uuid' },
                toWalletId: { type: 'string', format: 'uuid' },
                amount: { type: 'string', example: '50.00' },
                reference: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Transfer completed' },
        401: { description: 'Missing or invalid access token' },
        404: { description: 'Source (owned) or destination wallet not found' },
        409: { description: 'Inactive wallet / currency mismatch / duplicate reference' },
        422: { description: 'Invalid amount / insufficient funds / same wallet' },
      },
    },
  },
};
