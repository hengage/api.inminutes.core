import { startSession } from "mongoose";
import { Wallet } from "../models/wallet.model";

class WalletService {
  async creditWallet(dto: {
    amount: string;
    vendorId?: string;
    riderId?: string;
  }) {
    const session = await startSession();

    try {
      session.startTransaction();

      await Wallet.creditWallet(
        {
          amount: dto.amount,
          vendorId: dto.vendorId,
          riderId: dto.riderId,
        },
        session
      );

      await session.commitTransaction();
      await session.endSession();
      console.log("Credited wallet");
    } catch (error: any) {
      console.error({
        error: { status: error.status, message: error.message },
      });
      await session.endSession();
    }
  }

  async debitWallet(dto: {
    amount: string;
    vendorId?: string;
    riderId?: string;
  }) {
    const session = await startSession();

    try {
      session.startTransaction();

      await Wallet.debitWallet({
        amount: dto.amount,
        vendorId: dto.vendorId,
        riderId: dto.riderId,
      });

      await session.commitTransaction();
      await session.endSession();
      console.log("Debited wallet");
    } catch (error: any) {
      console.error({
        error: { status: error.status, message: error.message },
      });
      await session.endSession();
    }
  }
}

export const Walletservice = new WalletService();
