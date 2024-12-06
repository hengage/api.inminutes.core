import { Wallet } from "../../wallet";

export class AdminOpsWalletService {
    private walletModel = Wallet

    async getWalletForMerchant(merchantId: string) {
        const wallet = await this.walletModel.findOne({ merchantId })
            .select('-__v -updatedAt')
            .lean()
            .exec();
        return wallet
    }
}

