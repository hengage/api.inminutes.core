import axios from "axios";

import { PAYSTACK_SECRET_KEY } from "../../../config";
import { HandleException } from "../../../utils";
import { ICreateTransferRecipient } from "../transactions.interface";
import { walletRepo } from "../../wallet";

class TransferService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;

  constructor() {
    this.paystackAPIKey = `${PAYSTACK_SECRET_KEY}`;
    this.headers = {
      Authorization: `Bearer ${this.paystackAPIKey}`,
    };
  }

  async createRecipient(
    payload: ICreateTransferRecipient,
    merchant: "vendor" | "rider",
    merchantId: string
  ) {
    try {
      const response = await axios.post(
        "https://api.paystack.co/transferrecipient/",
        payload,
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

      await walletRepo.addCashoutAccount(cashoutAccount, merchant, merchantId);

      //   return response.data.data;
    } catch (error: any) {
      console.error({ error: error });
      throw new HandleException(
        error.response.status || error.status,
        error.response.data || error.message
      );
    }
  }
}

export const transferService = new TransferService();
