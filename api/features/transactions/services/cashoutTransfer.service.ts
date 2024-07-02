import axios from "axios";

import { PAYSTACK_SECRET_KEY } from "../../../config";
import { HandleException, generateReference } from "../../../utils";
import {
  ICreateTransferRecipient,
  InitializeTransferData,
} from "../transactions.interface";
import { walletRepo, walletService } from "../../wallet";
import { transactionService } from "./transaction.service";

/**
Service for managing cashout transfers for merchanrs.
@class
*/
class CashoutTransferService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;

  constructor() {
    this.paystackAPIKey = `${PAYSTACK_SECRET_KEY}`;
    this.headers = {
      Authorization: `Bearer ${this.paystackAPIKey}`,
    };
  }

  /**
  Adds a cashout account for a wallet.
  @param {object} payload - The cashout account data.
  @param {string} walletId - The wallet ID.
  */
  async addCashoutAccount(payload: ICreateTransferRecipient, walletId: string) {
    try {
      await walletService.checkDuplicateAccountNumber(
        walletId,
        payload.accountNumber
      );

      const data = {
        name: payload.accountName,
        account_number: payload.accountNumber,
        bank_code: payload.bankCode,
        currency: payload.currency,
        type: payload.recipientType,
        metadata: {
          channel: payload.metadata.channel,
        },
      };

      const response = await axios.post(
        "https://api.paystack.co/transferrecipient/",
        data,
        { headers: this.headers }
      );
      const {
        currency,
        type: recipientType,
        recipient_code: recipientCode,
        metadata: { channel },
        details: {
          account_number: accountNumber,
          account_name: accountName,
          bank_code: bankCode,
          bank_name: bankName,
        },
      } = response.data.data;

      const cashoutAccount = {
        channel,
        currency,
        recipientType,
        accountName,
        accountNumber,
        bankCode,
        bankName,
        recipientCode,
      };

      await walletRepo.addCashoutAccount(cashoutAccount, walletId);

      //   return response.data.data;
    } catch (error: any) {
      console.error({ error: error });
      throw new HandleException(
        error.status || error.response.status,
        error.message || error.response.data
      );
    }
  }

  /**
  Initializes a cashout transfer.
  @param {object} transferData - The transfer data.
  */
  async initialize(transferData: InitializeTransferData) {
    const { amount, recipientCode, reason, walletId } = transferData;
    const reference = generateReference();

    const data = {
      amount: parseFloat(amount) * 100,
      reason,
      source: "balance",
      reference,
      recipient: recipientCode,
    };

    try {
      await walletService.debitWallet({ amount, walletId });

      const response = await axios.post(
        "https://api.paystack.co/transfer",
        data,
        { headers: this.headers }
      );
      const { status, transfer_code: transferCode } = response.data.data;

      transactionService
        .createHistory({
          amount,
          reason,
          reference,
          wallet: walletId,
          type: "debit",
          recipientCode,
          transferCode,
          status,
        })
        .catch((error) => {
          console.log({ error: error });
        });

      console.log({ responseData: response.data.data });
    } catch (error: any) {
      console.error({ error: error.response });
      throw new HandleException(
        error.status || error.response.status,
        error.message || error.response.data
      );
    }
  }
}

export const cashoutTransferService = new CashoutTransferService();
