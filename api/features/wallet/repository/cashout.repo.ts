import { CashoutHistory } from "../models/cashout.model"
import { ICashoutHistoryDocument } from "../wallet.interface"


export class CashoutService {
    private cashoutHistoryModel = CashoutHistory

    createHistory(cashoutData: any): Promise<ICashoutHistoryDocument> {
        const cashoutHistory = new this.cashoutHistoryModel(cashoutData);
        cashoutHistory.save();
        return cashoutHistory.toObject()
    }

}