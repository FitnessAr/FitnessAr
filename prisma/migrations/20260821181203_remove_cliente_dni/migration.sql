/*
  Warnings:

  - You are about to drop the column `dni` on the `clientes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "clientes_dni_key";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "dni";
