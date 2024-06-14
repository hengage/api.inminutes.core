import {  CashoutRepository } from "../repository/cashout.repo";

export class CashoutService {
    private cashoutRepo: CashoutRepository

    constructor() {
        this.cashoutRepo = new CashoutRepository
    }

    async createHistory(cashoutData: any) {
        return await this.cashoutRepo.createHistory(cashoutData)
    }
}
