import { EventEmitter } from "events";
import { walletRepo, walletService } from "../features/wallet";
import { NotificationService } from "../features/notifications";
import { SocketServer } from "./socket/socket.services";
import { ordersService } from "../features/orders";
import { startSession } from "mongoose";
import { Events } from "../constants";
import { Msg } from "../utils";

class EventEmit {
  private eventEmitter: EventEmitter;
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    this.eventEmitter = new EventEmitter();

    this.listenToEvents();

    this.eventEmitter.on(Events.CREATE_WALLET, async (data) => {
      console.log({ eventData: data });

      try {
        const wallet = await walletRepo.create(data);
        console.log("Created wallet", wallet);
      } catch (error: unknown) {
        console.log({ error });
      }
    });

    this.eventEmitter.on(Events.NOTIFY_VENDOR_OF_ORDER, async (data) => {
      const { orderId, vendorId } = data;

      try {
        this.notificationService.createNotification({
          headings: { en: "New Order" },
          contents: {
            en:
              `A new order has been placed. ` +
              `Please confirm and fulfill the order as soon possible`,
          },
          data: { order: orderId },
          userId: vendorId,
        });
      } catch (error: unknown) {
        console.error({ error });
      }
    });

    this.eventEmitter.on(Events.CREDIT_VENDOR, async (data) => {
      console.log({ data });
      const { vendorId: merchantId, amount } = data;

      const session = await startSession();
      session.startTransaction();

      try {
        const wallet = await walletService.getWalletByMerchantId({
          merchantId,
          selectFields: "_id merchantId",
        });

        const updatedWallet = await walletService.creditWallet(
          {
            walletId: wallet?._id,
            amount,
          },
          session,
        );

        await session.commitTransaction();

        const socketServer = SocketServer.getInstance();
        socketServer.emitEvent(
          Events.WALLET_BALANCE,
          {
            _id: updatedWallet._id,
            balance: updatedWallet.balance,
          },
          merchantId,
        );
        await this.notificationService.createNotification({
          headings: { en: "Your Earnings Are In!" },
          contents: {
            en: Msg.WALLET_CREDITED(amount),
          },
          userId: wallet.merchantId,
        });
      } catch (error: unknown) {
        console.error({ error });
        await session.abortTransaction();
      } finally {
        await session.endSession();
      }
    });

    this.eventEmitter.on(Events.CREDIT_RIDER, async (data) => {
      const { riderId: merchantId, amount } = data;

      const session = await startSession();
      session.startTransaction();

      try {
        const wallet = await walletService.getWalletByMerchantId({
          merchantId,
          selectFields: "_id merchantId",
        });
        const updatedWallet = await walletService.creditWallet(
          {
            walletId: wallet?._id,
            amount,
          },
          session,
        );

        await session.commitTransaction();

        const socketServer = SocketServer.getInstance();
        socketServer.emitEvent(
          Events.WALLET_BALANCE,
          {
            _id: updatedWallet._id,
            balance: updatedWallet.balance,
          },
          merchantId,
        );
        await this.notificationService.createNotification({
          headings: { en: "Your Earnings Are In!" },
          contents: {
            en: Msg.WALLET_CREDITED(amount),
          },
          userId: wallet.merchantId,
        });
      } catch (error: unknown) {
        console.error({ error });
        await session.abortTransaction();
      } finally {
        await session.endSession();
      }
    });
  }

  private listenToEvents = () => {
    this.eventEmitter.on(Events.VENDOR_UNFULLFILED_ORDERS, async (data) => {
      console.log({ eventData: data });
      const vendorNewOrders = await ordersService.getNewOrdersForVendors(
        data.vendorId,
      );
      const socketServer = SocketServer.getInstance();

      socketServer.emitEvent(Events.VENDOR_UNFULLFILED_ORDERS, vendorNewOrders);
    });
  };

  emit(eventName: string, message: Record<string, unknown>) {
    console.log({ eventMessage: message });
    this.eventEmitter.emit(eventName, message);
  }
}

export const emitEvent = new EventEmit();
