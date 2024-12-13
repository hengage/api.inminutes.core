import { startSession, ClientSession } from "mongoose";
import { Wallet } from "../models/wallet.model";
import Big from "big.js";
import { NotificationService } from "../../notifications";
import { HandleException } from "../../../utils";
import { walletRepo } from "../repository/wallet.repository";
import { HTTP_STATUS_CODES } from "../../../constants";

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
  async debitWallet(
    data: { amount: string; walletId: string },
    session: ClientSession,
  ) {
    return await Wallet.debitWallet(
      {
        amount: data.amount,
        walletId: data.walletId,
      },
      session,
    );
  }

  /**
  @async
  Credit a wallet.
  @param {string} params.walletId - ID of the wallet to credit.
  @param {string} params.amount - Amount to credit.
  */
  async creditWallet(
    creditData: { walletId: string; amount: string },
    session: ClientSession,
  ) {
    const { amount, walletId } = creditData;
    const wallet = await Wallet.creditWallet(
      {
        amount: amount,
        walletId,
      },
      session,
    );
    console.log({ "Credited merchant": wallet });
    return wallet;
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
        HTTP_STATUS_CODES.CONFLICT,
        "You've already added this account number. Please use a different one.",
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
        HTTP_STATUS_CODES.NOT_FOUND,
        `Wallet for merchant: ${merchantId} not found`,
      );
    }
    return wallet;
  }
}

export const walletService = new WalletService();
