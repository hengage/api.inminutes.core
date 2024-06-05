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

  async addCashoutAccount(
    cashoutAccount: ICashoutAccount,
    walletId: string,
  ) {

    try {
      const wallet = await Wallet.findByIdAndUpdate(
        walletId,
        { $push: { cashoutAccounts: cashoutAccount } },
        { new: true, select: "-__v -updatedAt -createdAt" }
      ).lean();

      if (!wallet) {
        throw new HandleException(STATUS_CODES.NOT_FOUND, "Wallet not found");
      }

      console.log("Added new cashout account: ", wallet);

      return wallet;
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
    .select('cashoutAccounts')
    .lean()
    .exec();

    return cashoutAccounts
  }
}

export const walletRepo = new WalletRepository();
