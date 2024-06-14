import { CashoutHistory } from "../models/cashout.model"
import { ICashoutHistoryDocument } from "../wallet.interface"


export class CashoutRepository {
    private cashoutHistoryModel = CashoutHistory

    async createHistory(createCashoutHistoryDTO: any): Promise<ICashoutHistoryDocument> {
        const cashoutHistory = new this.cashoutHistoryModel(createCashoutHistoryDTO);
        cashoutHistory.save();
        return cashoutHistory.toObject()
    }

}