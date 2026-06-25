export const transferGetDocs = {
  '/transfers/{id}': {
    get: {
      tags: ['Transfers'],
      summary: 'Get a transfer I am a party to',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
      ],
      responses: {
        200: { description: 'Transfer' },
        401: { description: 'Missing or invalid access token' },
        404: { description: 'Transfer not found' },
      },
    },
  },
};
