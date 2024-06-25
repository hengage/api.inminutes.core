import { startSession } from "mongoose";
import { Wallet } from "../models/wallet.model";
import Big from "big.js";
import { NotificationService } from "../../notifications";
import { HandleException, STATUS_CODES } from "../../../utils";
import { walletRepo } from "../repository/wallet.repository";

class WalletService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

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

  async debitWallet(data: {
    amount: string;
    walletId?: string;
  }) {

    return await Wallet.debitWallet({
      amount: data.amount,
      walletId: data.walletId,
    });
  }

  async creditVendor(params: { vendorId: string; amount: string }) {
    const { amount, vendorId } = params;
    try {
      const wallet = await Wallet.creditWallet({ amount, vendorId });
      console.log({ "Credited vendor": wallet });

      await this.notificationService.createNotification({
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

      await this.notificationService.createNotification({
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

  async checkDuplicateAccountNumber(walletId: string, accountNumber: string) {
    const existingWallet = await Wallet.findOne({
      _id: walletId,
      "cashoutAccounts.accountNumber": accountNumber,
    })
      .select("cashoutAccounts.accountNumber")
      .lean()
      .exec();

    console.log({ existingWallet });

    if (existingWallet) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "You've already added this account number. Please use a different one."
      );
    }
    return;
  }

  async getCashoutAccounts(merchant: string, merchantId: string) {
    const cashoutAccounts = await walletRepo.getCashoutAccounts(
      merchant as "vendor" | "rider",
      merchantId
    );
    return cashoutAccounts;
  }

  async getVendorBalance(vendorId: string) {
    return await walletRepo.getVendorBalance(vendorId);
  }
  
  async getRiderBalance(riderId: string) {
    return await walletRepo.getRiderBalance(riderId);
  }
}

export const walletService = new WalletService();
