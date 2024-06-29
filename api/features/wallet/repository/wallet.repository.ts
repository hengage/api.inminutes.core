import { HandleException, STATUS_CODES } from "../../../utils";
import { Wallet } from "../models/wallet.model";
import { ICashoutAccount } from "../wallet.interface";

class WalletRepository {
  async create(payload: { merchantId?: string; merchantType?: string }) {
    const wallet = await Wallet.create({
      merchantId: payload.merchantId,
      merchantType: payload.merchantType,
    });

    return wallet;
  }

  async addCashoutAccount(cashoutAccount: ICashoutAccount, walletId: string) {
    try {
      const wallet = await Wallet.findById(walletId).select("cashoutAccounts");

      if (!wallet) {
        throw new HandleException(STATUS_CODES.NOT_FOUND, "Wallet not found");
      }

      wallet.cashoutAccounts.push(cashoutAccount);
      const updatedWallet = await wallet.save();

      return updatedWallet;
    } catch (error: any) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, error.message);
    }
  }

  async getCashoutAccounts(merchantId: string) {
    const cashoutAccounts = await Wallet.findOne({ merchantId })
      .select("cashoutAccounts")
      .lean()
      .exec();

    return cashoutAccounts;
  }

  async getBalance(merchantId: string) {
    return await Wallet.findOne({ merchantId })
      .select("balance")
      .lean()
      .exec();
  }

  async getWalletByMerchantId(data: {
    merchantId: string;
    selectFields: string;
  }) {
    const { merchantId, selectFields } = data;
    return await Wallet.findOne({ merchantId })
      .select(selectFields)
      .lean()
      .exec();
  }
}

export const walletRepo = new WalletRepository();
