/**
 * Idempotent seed for wallet-service. Wallets are created per real customer at
 * runtime (keyed by the JWT user id), so there is no static data to seed here.
 * Kept as a valid, re-runnable no-op for parity with the migration workflow.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('Wallet seed: no static data to seed (wallets are created per user at runtime).');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
