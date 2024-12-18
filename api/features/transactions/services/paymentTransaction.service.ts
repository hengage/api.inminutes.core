import axios from "axios";
import { HandleException, Msg, generateReference } from "../../../utils";
// import *as crypto from "crypto";
import { createHmac } from "crypto";
import { Request } from "express";
import { PAYSTACK_SECRET_KEY } from "../../../config";
import { emitEvent } from "../../../services";
import {
  IInitializeTransaction,
  ICreateTransactionData,
} from "../transactions.interface";
import { TransactionRepository } from "../repository/transaction.repo";
import { cashoutTransferService } from "./cashoutTransfer.service";
import { SocketServer } from "../../../services/socket/socket.services";
import { ClientSession } from "mongoose";
import { Events, HTTP_STATUS_CODES } from "../../../constants";

/**
Service for managing transactions and interacting with Paystack API.
@class
*/
class PaymentTransactionService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;
  private transactionRepo: TransactionRepository;
  // private socketServer = SocketServer.getInstance();

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
        },
      );

      console.log({ reponseData: response.data });

      this.createHistory({
        amount: initializeTransactionData.amount,
        reason: initializeTransactionData.metadata.reason,
        customer: initializeTransactionData.metadata.customerId,
        reference: response.data.data.reference,
        status: "pending",
      })
        .then((createdHistory) => console.log(createdHistory))
        .catch((error: unknown) => {
          console.error("Error creating transaction history: ", error);
        });

      console.log({});

      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof HandleException) {
        throw new HandleException(error.status, error.message);
      } else {
        throw new HandleException(HTTP_STATUS_CODES.SERVER_ERROR,
          Msg.ERROR_UNKNOWN_ERROR());
      }
    }
  }
  /**
   * Processes incoming webhook events from Paystack and
   *  takes appropriate actions based on the event type,
   * @param req
   */
  webhook(req: Request) {
    const hash = createHmac("sha512", `${PAYSTACK_SECRET_KEY}`).update(
      JSON.stringify(req.body),
    );
    const digest = hash.digest("hex");

    if (digest === req.headers["x-paystack-signature"]) {
      console.log(req.body);
      const event = req.body;
      const { reference, status, paid_at: paidAt } = event.data;

      switch (event.event) {
        case "charge.success":
          console.log({ metadata: event.data.metadata });
          this.transactionRepo.updateStatus({ reference, status, paidAt });
          const { purpose, orderId, vendorId } = event.data.metadata;
          if (purpose === "product purchase") {
            emitEvent.emit(Events.NOTIFY_VENDOR_OF_ORDER, {
              orderId,
              vendorId,
            });
          }
          break;
        case "transfer.success":
        case "transfer.failed":
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
    } else {
      throw new HandleException(
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid signature",
      );
    }
  }

  /**
  @async
  Creates a new transaction history entry.
  @param {object} transactionHistoryData - The data to create the transaction history entry.
  */
  async createHistory(
    createTransactionData: ICreateTransactionData,
    session?: ClientSession,
  ) {
    return await this.transactionRepo.createHistory(
      createTransactionData,
      session,
    );
  }

  async getTransactionByReference(reference: string, selectFields: string) {
    return this.transactionRepo.getTransactionByReference(
      reference,
      selectFields,
    );
  }

  /**
Handles a failed cashout transaction.  This method reverses the failed cashout transaction by 
calling the cashoutTransferService.reverseDebit method

@param {object} event - The event object containing the transaction data.
*/
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
      socketServer.emitEvent(
        Events.WALLET_BALANCE,
        {
          _id: wallet?._id,
          balance: wallet?.balance,
        },
        wallet?.merchantId,
      );
    } catch (error) {
      console.error({ error });
    }
  }

  async getHistory(params: {
    walletId: string;
    page: number;
    startDate?: Date | string;
    endDate?: Date | string;
  }) {
    const { walletId, page, startDate, endDate } = params;
    return await this.transactionRepo.getHistory({
      walletId,
      page,
      startDate,
      endDate,
    });
  }

  async getDetails(transactionId: string) {
    return await this.transactionRepo.getDetails(transactionId);
  }
}

export const paymentTransactionService = new PaymentTransactionService();
