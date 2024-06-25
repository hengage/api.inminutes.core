import axios from "axios";

import { PAYSTACK_SECRET_KEY } from "../../../config";
import { HandleException, generateReference } from "../../../utils";
import {
  ICreateTransferRecipient,
  InitializeTransferData,
} from "../transactions.interface";
import { walletRepo, walletService } from "../../wallet";

class TransferService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;

  constructor() {
    this.paystackAPIKey = `${PAYSTACK_SECRET_KEY}`;
    this.headers = {
      Authorization: `Bearer ${this.paystackAPIKey}`,
    };
  }

  async createRecipient(payload: ICreateTransferRecipient, walletId: string) {
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

  async initialize(payload: InitializeTransferData) {
    const { amount, recipientCode, reason, walletId } = payload;
    const data = {
      amount,
      reason,
      source: "balance",
      reference: generateReference,
      recipient: recipientCode,
    };

    try {
      await walletService.debitWallet({ amount, walletId });

      const response = await axios.post(
        "https://api.paystack.co/transfer",
        data,
        { headers: this.headers }
      );

      console.log({ response });
    } catch (error: any) {
      console.error({ error: error.response });
      throw new HandleException(
        error.status || error.response.status,
        error.message || error.response.data
      );
    }
  }
}

export const transferService = new TransferService();
