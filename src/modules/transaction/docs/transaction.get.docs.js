export const transactionGetDocs = {
  '/transactions/{id}': {
    get: {
      tags: ['Transactions'],
      summary: 'Get a single transaction',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Transaction' },
        401: { description: 'Missing or invalid access token' },
        404: { description: 'Transaction not found' },
      },
    },
  },
};
