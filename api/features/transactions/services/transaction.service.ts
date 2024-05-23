import axios from "axios";
import {
  HandleException,
  STATUS_CODES,
  generateReference,
} from "../../../utils";
// import *as crypto from "crypto";
import { createHmac } from "crypto";
import { Request } from "express";
import { PAYSTACK_SECRET_KEY } from "../../../config";

class TransactionService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;
  constructor() {
    this.paystackAPIKey = `${PAYSTACK_SECRET_KEY}`;
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

  webhook(req: Request) {
    const hash = createHmac("sha512", `${PAYSTACK_SECRET_KEY}`).update(
      JSON.stringify(req.body)
    );
    console.log({ hash });

    const digest = hash.digest("hex");
    console.log({ digest });

    if (digest === req.headers["x-paystack-signature"]) {
      console.log(req.body);
    } else {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, "Invalid signature");
    }
  }
}

export const transactionService = new TransactionService();
