/*
  Warnings:

  - You are about to drop the column `company` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `isVerifiedB2B` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `company`,
    DROP COLUMN `isVerifiedB2B`,
    ADD COLUMN `companyName` VARCHAR(191) NULL,
    ADD COLUMN `fssaiNumber` VARCHAR(191) NULL,
    ADD COLUMN `gstNumber` VARCHAR(191) NULL,
    ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'b2c';
