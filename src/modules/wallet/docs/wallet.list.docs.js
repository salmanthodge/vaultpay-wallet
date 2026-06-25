export const walletListDocs = {
  '/wallets': {
    get: {
      tags: ['Wallets'],
      summary: 'List my wallets',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Array of wallets' },
        401: { description: 'Missing or invalid access token' },
      },
    },
  },
};
