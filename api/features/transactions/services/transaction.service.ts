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
  ICreateTransactionHistoryData,
} from "../transactions.interface";
import { TransactionRepository } from "../repository/transaction.repo";
import { walletService } from "../../wallet";
import { cashoutTransferService } from "./cashoutTransfer.service";
import { SocketServer } from "../../../services/socket/socket.services";

/**
Service for managing transactions and interacting with Paystack API.
@class
*/
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

  /**
   * @async
   * Initializes a transaction on Paystack for a customer's payment,
   * @param {object} initializeTransactionData - The transaction initialization parameters.
   * @returns
   */
  async initialize(initializeTransactionData: IInitializeTransaction) {
    const payload = {
      amount: parseFloat(initializeTransactionData.amount) * 100,
      email: initializeTransactionData.email,
      metadata: initializeTransactionData.metadata,
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

  /**
   * Processes incoming webhook events from Paystack and
   *  takes appropriate actions based on the event type,
   * @param req
   */
  webhook(req: Request) {
    const hash = createHmac("sha512", `${PAYSTACK_SECRET_KEY}`).update(
      JSON.stringify(req.body)
    );
    const digest = hash.digest("hex");

    // if (digest === req.headers["x-paystack-signature"]) {
    console.log(req.body);
    const event = req.body;

    switch (event.event) {
      case "charge.success":
        console.log({ metadata: event.data.metadata });
        const { purpose, orderId, vendorId } = event.data.metadata;
        if (purpose === "product purchase") {
          emitEvent.emit("notify-vendor-of-new-order", { orderId, vendorId });
        }
        break;
      case "transfer.success":
      case "transfer.failed":
        const { reference, status } = event.data;
        console.log({ reference, status });
        this.transactionRepo.updateStatus({ reference, status });

        // Credit wallet on failed transfer
        if (event.event === "transfer.failed") {
          this.handleFailedCashoutTransaction(event);
        }
        break;
      default:
        console.warn(`Unknown event type: ${event.event}`);
    }
    // } else {
    // throw new HandleException(STATUS_CODES.BAD_REQUEST, "Invalid signature");
    // }
  }

  /**
  @async
  Creates a new transaction history entry.
  @param {object} transactionHistoryData - The data to create the transaction history entry.
  */
  async createHistory(transactionHistoryData: ICreateTransactionHistoryData) {
    return await this.transactionRepo.createHistory(transactionHistoryData);
  }

  async getTransactionByReference(reference: string, selectFields: string) {
    return this.transactionRepo.getTransactionByReference(
      reference,
      selectFields
    );
  }

  async handleFailedCashoutTransaction(event: any) {
    let { amount } = event.data;
    const { reference, status, transfer_code: transferCode } = event.data;
    const { recipient_code: recipientCode } = event.data.recipient;
    amount = parseFloat(amount) / 100;

    try {
      const wallet = await cashoutTransferService.reverseDebit({
        amount,
        trxReference: reference,
        transferCode,
        recipientCode,
        status,
      });

      const socketServer = SocketServer.getInstance();
      socketServer.emitEvent("wallet-balance", {
        _id: wallet._id,
        balance: wallet.balance,
      });
    } catch (error) {
      console.error({ error });
    }
  }
}

export const transactionService = new TransactionService();
