import { HandleException, STATUS_CODES } from "../../../utils";
import { Wallet } from "../models/wallet.model";
import { ICashoutAccount } from "../wallet.interface";

class WalletRepository {
  async create(payload: { riderId?: string; vendorId?: string }) {
    const wallet = await Wallet.create({
      rider: payload.riderId,
      vendor: payload.vendorId,
    });

    return wallet;
  }

  async addCashoutAccount(cashoutAccount: ICashoutAccount, walletId: string) {
    try {
      // const wallet = await Wallet.findOneAndUpdate(
      //   {_id: walletId},
      //   { $push: { cashoutAccounts: cashoutAccount } },
      //   { new: true, select: "-__v -updatedAt -createdAt", runValidators: true }
      // ).lean();
      const wallet = await Wallet.findById(walletId).select("cashoutAccounts");

      if (!wallet) {
        throw new HandleException(STATUS_CODES.NOT_FOUND, "Wallet not found");
      }

      wallet.cashoutAccounts.push(cashoutAccount);
      const updatedWallet = await wallet.save();

      console.log("Added new cashout account: ", updatedWallet);

      return updatedWallet;
    } catch (error: any) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, error.message);
    }
  }

  async getCashoutAccounts(merchant: "vendor" | "rider", merchantId: string) {
    const query: { vendor?: string; rider?: string } = {};

    if (merchant === "vendor") {
      query.vendor = merchantId;
    } else if (merchant === "rider") {
      query.rider = merchantId;
    }

    const cashoutAccounts = await Wallet.findOne(query)
      .select("cashoutAccounts")
      .lean()
      .exec();

    return cashoutAccounts;
  }

  async getVendorBalance(vendorId: string) {
    return await Wallet.findOne({ vendor: vendorId })
      .select("balance")
      .lean()
      .exec();
  }

  async getRiderBalance(riderId: string) {
    return await Wallet.findOne({ rider: riderId })
      .select("balance")
      .lean()
      .exec();
  }
}

export const walletRepo = new WalletRepository();
