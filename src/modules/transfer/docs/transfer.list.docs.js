export const transferListDocs = {
  '/transfers': {
    get: {
      tags: ['Transfers'],
      summary: 'List transfers I sent or received (paginated)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      ],
      responses: {
        200: { description: 'Array of transfers + pagination meta' },
        401: { description: 'Missing or invalid access token' },
      },
    },
  },
};
