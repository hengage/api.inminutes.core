import { startSession } from "mongoose";
import { Wallet } from "../models/wallet.model";
import Big from "big.js";
import { notificationService } from "../../notifications";

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

  async creditVendor(params: { vendorId: string; amount: string }) {
    const { amount, vendorId } = params;
    try {
      const wallet = await Wallet.creditWallet({ amount, vendorId });
      console.log({ "Credited vendor": wallet });

      await notificationService.createNotification({
        headings: { en: "Your Earnings Are In!" },
        contents: {
          en:
            `${amount} has been successfully credited to your wallet. ` +
            `Head to your dashboard to see your new balance`,
        },
        userId: vendorId,
      });
    } catch (error: any) {
      console.error({ error });
    }
  }

  async creditRider(params: { riderId: string; amount: string }) {
    let { riderId, amount } = params;
    amount = Big(80).div(100).mul(amount).toString();

    try {
      const wallet = await Wallet.creditWallet({ amount, riderId });
      console.log({ "Credited rider": wallet });

      await notificationService.createNotification({
        headings: { en: "Your Earnings Are In!" },
        contents: {
          en:
          `${amount} has been successfully credited to your wallet. ` +
          `Head to your dashboard to see your new balance`,
      },
        userId: riderId,
      });
    } catch (error: any) {
      console.error({ error });
    }
  }
}

export const walletservice = new WalletService();
