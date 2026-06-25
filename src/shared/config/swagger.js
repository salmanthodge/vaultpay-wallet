import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';
import { moduleDocs } from '../../modules/index.js';

/** Assembles the OpenAPI spec from per-endpoint docs fragments (rules/07). */
export const buildOpenApiSpec = () => ({
  openapi: '3.0.3',
  info: {
    title: 'VaultPay Wallet Service',
    version: '1.0.0',
    description: 'Wallets, balances, ledger transactions and transfers.',
  },
  servers: [{ url: `http://localhost:${env.PORT}` }],
  paths: moduleDocs,
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
});

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(buildOpenApiSpec(), {
  customSiteTitle: 'VaultPay Wallet API',
});
