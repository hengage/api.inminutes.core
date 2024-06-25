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
import { emitEvent } from "../../../services";
import {
  IInitializeTransaction,
  createTransactionHistoryData,
} from "../transactions.interface";
import { TransactionRepository } from "../repository/transaction.repo";

class TransactionService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;
  private transactionRepo: TransactionRepository;

  constructor() {
    this.paystackAPIKey = `${PAYSTACK_SECRET_KEY}`;
    this.headers = {
      Authorization: `Bearer ${this.paystackAPIKey}`,
    };
    this.transactionRepo = new TransactionRepository();
  }

  async initialize(params: IInitializeTransaction) {
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
    const digest = hash.digest("hex");

    if (digest === req.headers["x-paystack-signature"]) {
      console.log(req.body);
      const event = req.body;

      if (event.event === "charge.success") {
        console.log({ metadata: event.data.metadata });
        const { purpose, orderId, vendorId } = event.data.metadata;

        if (purpose === "product purchase") {
          emitEvent("notify-vendor-of-new-order", { orderId, vendorId });
        }
      }
    } else {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, "Invalid signature");
    }
  }

  async createHistory(transactionHistoryData: createTransactionHistoryData) {
    return await this.transactionRepo.createHistory(transactionHistoryData);
  }
}

export const transactionService = new TransactionService();
