import { EventEmitter } from "events";
import { walletRepo, walletService } from "../features/wallet";
import { NotificationService } from "../features/notifications";
import { SocketServer } from "./socket/socket.services";
import { ordersService } from "../features/orders";
import { startSession } from "mongoose";

console.log({ SocketServer });
// const socketServer = SocketServer.getInstance()

class EventEmit {
  private eventEmitter: EventEmitter;
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    this.eventEmitter = new EventEmitter();

    this.listenToEvents();

    this.eventEmitter.on("create-wallet", async (data) => {
      console.log({ eventData: data });

      try {
        const wallet = await walletRepo.create(data);
        console.log("Created wallet", wallet);
      } catch (error: any) {
        console.log({ error });
      }
    });

    this.eventEmitter.on("notify-vendor-of-new-order", async (data) => {
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
      } catch (error: any) {
        console.error({ error });
      }
    });

    this.eventEmitter.on("credit-vendor", async (data) => {
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
          session
        );

        await session.commitTransaction();

        const socketServer = SocketServer.getInstance();
        socketServer.emitEvent("wallet-balance", {
          _id: updatedWallet._id,
          balance: updatedWallet.balance,
        });
        await this.notificationService.createNotification({
          headings: { en: "Your Earnings Are In!" },
          contents: {
            en:
              `${amount} has been successfully credited to your wallet. ` +
              `Head to your dashboard to see your new balance`,
          },
          userId: wallet.merchantId,
        });
      } catch (error: any) {
        console.error({ error });
        await session.abortTransaction();
      } finally {
        await session.endSession();
      }
    });

    this.eventEmitter.on("credit-rider", async (data) => {
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
          session
        );

        await session.commitTransaction();

        const socketServer = SocketServer.getInstance();
        socketServer.emitEvent("wallet-balance", {
          _id: updatedWallet._id,
          balance: updatedWallet.balance,
        });
        await this.notificationService.createNotification({
          headings: { en: "Your Earnings Are In!" },
          contents: {
            en:
              `${amount} has been successfully credited to your wallet. ` +
              `Head to your dashboard to see your new balance`,
          },
          userId: wallet.merchantId,
        });
      } catch (error: any) {
        console.error({ error });
        await session.abortTransaction();
      } finally {
        await session.endSession();
      }
    });
  }

  private listenToEvents = () => {
    this.eventEmitter.on("vendor-new-orders", async (data) => {
      console.log({ eventData: data });
      const vendorNewOrders = await ordersService.getNewOrdersForVendors(
        data.vendorId
      );
      const socketServer = SocketServer.getInstance();

      socketServer.emitEvent("vendor-new-orders", vendorNewOrders);
    });
  };

  emit(eventName: string, message: any) {
    console.log({ eventMessage: message });
    this.eventEmitter.emit(eventName, message);
  }
}

export const emitEvent = new EventEmit();
