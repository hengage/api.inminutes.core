import { HTTP_STATUS_CODES } from "../../../constants";
import { HandleException, Msg } from "../../../utils";
import { Wallet } from "../models/wallet.model";
import { ICashoutAccount } from "../wallet.interface";

/**
Repository for managing wallets.
class WalletRepository {
@class
*/
class WalletRepository {
  async create(payload: { merchantId?: string; merchantType?: string }) {
    const wallet = await Wallet.create({
      merchantId: payload.merchantId,
      merchantType: payload.merchantType,
    });

    return wallet;
  }

  /**
  @async
  Adds a cashout account to a wallet.
  @param {object} cashoutAccount - The cashout account data.
  @param {string} walletId - The ID of the wallet.
  */
  async addCashoutAccount(cashoutAccount: ICashoutAccount, walletId: string) {
    try {
      const wallet = await Wallet.findById(walletId).select("cashoutAccounts");

      if (!wallet) {
        throw new HandleException(
          HTTP_STATUS_CODES.NOT_FOUND,
          Msg.ERROR_NO_WALLET_FOUND(walletId)
        );
      }

      wallet.cashoutAccounts.push(cashoutAccount);
      const updatedWallet = await wallet.save();

      return updatedWallet;
    } catch (error: any) {
      throw new HandleException(HTTP_STATUS_CODES.NOT_FOUND, error.message);
    }
  }

  /**
    @async
    Retrieves a list of cashout accounts for a merchant.
    @param {string} merchantId - The ID of the merchant.
  */
  async getCashoutAccounts(merchantId: string) {
    const cashoutAccounts = await Wallet.findOne({ merchantId })
      .select("cashoutAccounts")
      .lean()
      .exec();

    return cashoutAccounts;
  }


  /**
   @async
    Retrieves the balance of a wallet.
    @param {string} merchantId - The ID of the merchant.
  */
  async getBalance(merchantId: string) {
    return await Wallet.findOne({ merchantId })
      .select("balance totalEarnings")
      .lean()
      .exec();
  }

  /**
   Retrieves a wallet by merchant ID with specified fields.
   @param {string} data.merchantId - The ID of the merchant.
   @param {string} data.selectFields - The fields to select.
 */
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
