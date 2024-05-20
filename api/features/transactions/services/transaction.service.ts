import axios from "axios";
import { PAYSTACK_API_KEY } from "../../../config";
import { HandleException, generateReference } from "../../../utils";

class TransactionService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;
  constructor() {
    this.paystackAPIKey = `${PAYSTACK_API_KEY}`;
    this.headers = {
      Authorization: `Bearer ${this.paystackAPIKey}`,
    };
  }

  async initialize(params: { email: string; amount: string; metadata: any }) {
    const payload = {
      amount: parseInt(params.amount) * 100,
      email: params.email,
      metadata: params.metadata,
      reference: generateReference,
      channels: ["card", "ussd", "bank_transfer"],
    };

    try {
      const response = await axios.post(
        `https://api.paystack.co/transaction/initialize`,
        payload,
        {
          headers: this.headers,
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error({ error: error.response.data });
      throw new HandleException(error.status, error.message);
    }
  }
}

export const transactionService = new TransactionService();
