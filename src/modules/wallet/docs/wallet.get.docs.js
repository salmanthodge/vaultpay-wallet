export const walletGetDocs = {
  '/wallets/{id}': {
    get: {
      tags: ['Wallets'],
      summary: 'Get a wallet and its balance',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Wallet' },
        401: { description: 'Missing or invalid access token' },
        404: { description: 'Wallet not found' },
      },
    },
  },
};
