-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "balance" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "status" "WalletStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "balance_after" DECIMAL(20,4) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "description" TEXT,
    "transfer_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" UUID NOT NULL,
    "from_wallet_id" UUID NOT NULL,
    "to_wallet_id" UUID NOT NULL,
    "amount" DECIMAL(20,4) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_currency_key" ON "wallets"("user_id", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE INDEX "transactions_wallet_id_idx" ON "transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "transactions_transfer_id_idx" ON "transactions"("transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_reference_key" ON "transfers"("reference");

-- CreateIndex
CREATE INDEX "transfers_from_wallet_id_idx" ON "transfers"("from_wallet_id");

-- CreateIndex
CREATE INDEX "transfers_to_wallet_id_idx" ON "transfers"("to_wallet_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_wallet_id_fkey" FOREIGN KEY ("from_wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_wallet_id_fkey" FOREIGN KEY ("to_wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
