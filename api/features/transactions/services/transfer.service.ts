import axios from "axios";

import { PAYSTACK_SECRET_KEY } from "../../../config";
import { HandleException } from "../../../utils";
import { ICreateTransferRecipient } from "../transactions.interface";

class TransferService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;

  constructor() {
    this.paystackAPIKey = `${PAYSTACK_SECRET_KEY}`;
    this.headers = {
      Authorization: `Bearer ${this.paystackAPIKey}`,
    };
  }

  async createRecipient(params: ICreateTransferRecipient) {
    try {
      const response = await axios.post(
        "https://api.paystack.co/transferrecipient/",
        params,
        { headers: this.headers }
      );
      return response.data.data
    } catch (error: any) {
      console.error({ error: error.response.data });
      throw new HandleException(error.status, error.message);
    }
  }
}

export const transferService = new TransferService();
