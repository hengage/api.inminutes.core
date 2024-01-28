import { Wallet } from "../models/wallet.model";

class WalletRepository {
  async create(payload: { riderId?: string; vendorId: string }) {
    const wallet = await Wallet.create({
      rider: payload.riderId,
      vendor: payload.vendorId,
    });

    return wallet;
  }
}

export const walletRepo = new WalletRepository();
