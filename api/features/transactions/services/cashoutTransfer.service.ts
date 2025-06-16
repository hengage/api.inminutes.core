import axios from "axios";
import { startSession } from "mongoose";

import { PAYSTACK_SECRET_KEY } from "../../../config";
import { HandleException, generateReference } from "../../../utils";
import {
  ICreateTransferRecipient,
  InitializeCashoutTransferData,
} from "../transactions.interface";
import { walletRepo, walletService } from "../../wallet";
import { paymentTransactionService } from "./paymentTransaction.service";
import { NotificationService } from "../../notifications";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../../../constants";

/**
Service for managing cashout transfers for merchanrs.
@class
*/
class CashoutTransferService {
  private paystackAPIKey: string;
  private headers: Record<string, string>;
  private notificationService: NotificationService;

  constructor() {
    this.paystackAPIKey = `${PAYSTACK_SECRET_KEY}`;
    this.headers = {
      Authorization: `Bearer ${this.paystackAPIKey}`,
    };
    this.notificationService = new NotificationService();
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
  async initialize(transferData: InitializeCashoutTransferData) {
    const {
      amount,
      recipientCode,
      reason,
      walletId,
      bankName,
      accountName,
      accountNumber,
    } = transferData;
    const reference = generateReference();

    const data = {
      amount: parseFloat(amount) * 100,
      reason,
      source: "balance",
      reference,
      recipient: recipientCode,
    };

    const session = await startSession();
    session.startTransaction();

    try {
      await walletService.debitWallet({ amount, walletId }, session);

      const response = await axios.post(
        "https://api.paystack.co/transfer",
        data,
        { headers: this.headers }
      );
      const { status, transfer_code: transferCode } = response.data.data;

      await paymentTransactionService.createHistory(
        {
          amount,
          reason,
          reference,
          wallet: walletId,
          type: TRANSACTION_TYPE.DEBIT,
          recipientCode,
          bankName,
          accountName,
          accountNumber,
          transferCode,
          status,
        },
        session
      );

      await session.commitTransaction();

      console.log({ responseData: response.data.data });
    } catch (error: any) {
      console.error({ error: error.response });
      await session.abortTransaction();
      throw new HandleException(
        error.status || error.response.status,
        error.message || error.response.data
      );
    } finally {
      session.endSession();
    }
  }

  /**
    @async
    Reverse a debit transaction.
    @param {string} data.amount - Amount to reverse.
    @param {string} data.trxReference - Transaction reference.
  */
  async reverseDebit(data: {
    amount: string;
    trxReference: string;
    recipientCode: string;
    transferCode: string;
    status: TRANSACTION_STATUS;
  }) {
    const { amount, trxReference, recipientCode, transferCode, status } = data;

    const session = await startSession();
    session.startTransaction();

    try {
      const transaction =
        await paymentTransactionService.getTransactionByReference(
          trxReference,
          "wallet"
        );
      const walletId = transaction.wallet;
      const wallet = await walletService.creditWallet(
        { amount, walletId },
        session
      );

      await paymentTransactionService.createHistory(
        {
          amount,
          reason: "reversal",
          reference: trxReference,
          wallet: walletId,
          type: TRANSACTION_TYPE.CREDIT,
          recipientCode,
          transferCode,
          status,
        },
        session
      );

      await session.commitTransaction();

      this.notificationService.createNotification({
        headings: { en: "Funds reversed!" },
        contents: {
          en:
            `Hi, ${amount} has been refunded to your wallet. ` +
            `You can try to cashout again, or wait for some minutes`,
        },
        userId: wallet?.merchantId,
      });

      console.log(`Reversed ${amount} for wallet: ${walletId}`);

      return wallet;
    } catch (error: any) {
      await session.abortTransaction();
      console.error("Error reversing debit transaction", error);
    } finally {
      await session.endSession();
    }
  }
}

export const cashoutTransferService = new CashoutTransferService();
