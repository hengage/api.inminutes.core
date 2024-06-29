import { startSession } from "mongoose";
import { Wallet } from "../models/wallet.model";
import Big from "big.js";
import { NotificationService } from "../../notifications";
import { HandleException, STATUS_CODES } from "../../../utils";
import { walletRepo } from "../repository/wallet.repository";
import { TransactionHistory } from "../../transactions/models/transaction.model";

class WalletService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async debitWallet(data: { amount: string; walletId?: string }) {
    return await Wallet.debitWallet({
      amount: data.amount,
      walletId: data.walletId,
    });
  }

  async creditVendor(params: { vendorId: string; amount: string }) {
    const { amount, vendorId } = params;
    try {
      const wallet = await Wallet.creditWalletByMerchantType({
        amount,
        vendorId,
      });
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
      const wallet = await Wallet.creditWalletByMerchantType({
        amount,
        riderId,
      });
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

  async reverseDebit(data: { amount: string; trxReference: string }) {
    const { amount, trxReference } = data;

    const transaction = await TransactionHistory.findOne({
      reference: trxReference,
    })
      .select("wallet ")
      .lean()
      .exec();

    const walletId = transaction?.wallet;
    console.log({transaction, walletId})
    const wallet = await Wallet.creditWallet({ amount, walletId });
    console.log({wallet})
    let userId;
    
    if (wallet.rider) {
      userId = wallet.rider;
    } else if (wallet.vendor) {
      userId = wallet.vendor;
    }

    this.notificationService.createNotification({
      headings: { en: "Funds reversed!" },
      contents: {
        en:
          `Hi, ${amount} has been refunded to your wallet. ` +
          `You can try to cashout again, or wait for some minutes`,
      },
      userId,
    });
    console.log(`Reversed ${amount} for wallet: ${walletId}`);
  }
}

export const walletService = new WalletService();
