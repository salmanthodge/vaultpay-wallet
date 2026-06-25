-- VaultPay wallet-service — local DB bootstrap.
-- Run ONCE as the postgres superuser against the shared PG17 instance (port 5432).
-- Reuses the existing "vaultpay" role (created by the auth-service bootstrap) and
-- creates a SEPARATE database "vaultpay_wallet" on the same server (database-per-service).
--
-- Usage (PowerShell):
--   $env:PGPASSWORD='<postgres-password>'
--   & 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -h localhost -p 5432 -f scripts\db-bootstrap.sql
--
-- Idempotent: safe to re-run.

-- 1. Role (created already by auth bootstrap; create here too if missing)
SELECT 'CREATE ROLE vaultpay LOGIN PASSWORD ''vaultpay'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vaultpay')\gexec

-- 2. Separate database for this service
SELECT 'CREATE DATABASE vaultpay_wallet OWNER vaultpay'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vaultpay_wallet')\gexec

-- 3. Privileges
GRANT ALL PRIVILEGES ON DATABASE vaultpay_wallet TO vaultpay;
