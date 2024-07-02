import { startSession } from "mongoose";
import { Wallet } from "../models/wallet.model";
import Big from "big.js";
import { NotificationService } from "../../notifications";
import { HandleException, STATUS_CODES } from "../../../utils";
import { walletRepo } from "../repository/wallet.repository";
import { TransactionHistory } from "../../transactions/models/transaction.model";
import { transactionService } from "../../transactions/services/transaction.service";

/**
Provides methods for managing wallet operations.
@class
*/
class WalletService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /*
  Debits a wallet.
  @param {string} data.amount - Amount to debit.
  @param {string} data.walletId - ID of the wallet to debit.
  */
  async debitWallet(data: { amount: string; walletId: string }) {
    return await Wallet.debitWallet({
      amount: data.amount,
      walletId: data.walletId,
    });
  }

  /**
  @async
  Credit a wallet.
  @param {string} params.walletId - ID of the wallet to credit.
  @param {string} params.amount - Amount to credit.
  */
  async creditWallet(params: { walletId: string; amount: string }) {
    const { amount, walletId } = params;
    try {
      const wallet = await Wallet.creditWallet({
        amount: amount,
        walletId,
      });
      console.log({ "Credited merchant": wallet });

      await this.notificationService.createNotification({
        headings: { en: "Your Earnings Are In!" },
        contents: {
          en:
            `${amount} has been successfully credited to your wallet. ` +
            `Head to your dashboard to see your new balance`,
        },
        userId: wallet.merchantId,
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

  /**
   @async
  Get cashout accounts for a merchant.
  @param {string} merchantId - ID of the merchant.
  */
  async getCashoutAccounts(merchantId: string) {
    const cashoutAccounts = await walletRepo.getCashoutAccounts(merchantId);
    return cashoutAccounts;
  }

  async getBalance(merchantId: string) {
    return await walletRepo.getBalance(merchantId);
  }

  async getWalletByMerchantId(data: {
    merchantId: string;
    selectFields: string;
  }) {
    const { merchantId, selectFields } = data;
    const wallet = await walletRepo.getWalletByMerchantId({
      merchantId,
      selectFields,
    });
    if (!wallet) {
      throw new HandleException(
        STATUS_CODES.NOT_FOUND,
        `Wallet for merchant: ${merchantId} not found`
      );
    }
    return wallet;
  }

  /**
    @async
    Reverse a debit transaction.
    @param {string} data.amount - Amount to reverse.
    @param {string} data.trxReference - Transaction reference.
  */
  async reverseDebit(data: { amount: string; trxReference: string }) {
    const { amount, trxReference } = data;

    const transaction = await transactionService.getTransactionByReference(trxReference, 'wallet')
    const walletId = transaction.wallet;
    const wallet = await Wallet.creditWallet({ amount, walletId });

    this.notificationService.createNotification({
      headings: { en: "Funds reversed!" },
      contents: {
        en:
          `Hi, ${amount} has been refunded to your wallet. ` +
          `You can try to cashout again, or wait for some minutes`,
      },
      userId: wallet.merchantId,
    });
    console.log(`Reversed ${amount} for wallet: ${walletId}`);
  }
}

export const walletService = new WalletService();
