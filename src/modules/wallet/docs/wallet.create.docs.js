export const walletCreateDocs = {
  '/wallets': {
    post: {
      tags: ['Wallets'],
      summary: 'Create a wallet for a currency',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['currency'],
              properties: { currency: { type: 'string', example: 'USD' } },
            },
          },
        },
      },
      responses: {
        201: { description: 'Wallet created' },
        401: { description: 'Missing or invalid access token' },
        409: { description: 'Wallet for this currency already exists' },
        422: { description: 'Unsupported currency' },
      },
    },
  },
};
