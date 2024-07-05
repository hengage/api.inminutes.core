import { EventEmitter } from "events";
import { walletRepo, walletService } from "../features/wallet";
import { NotificationService } from "../features/notifications";
import { SocketServer } from "./socket/socket.services";

class EventEmit {
  private eventEmitter: EventEmitter;
  private notificationService: NotificationService;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.notificationService = new NotificationService();

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
      try {
        const wallet = await walletService.getWalletByMerchantId({
          merchantId,
          selectFields: "_id merchantId",
        });

        const updatedWallet = await walletService.creditWallet({
          walletId: wallet?._id,
          amount,
        });
        // const socketServer = SocketServer.getInstance();
        // socketServer.emitEvent("wallet-balance", {
        //   _id: updatedWallet._id,
        //   balance: updatedWallet.balance,
        // });
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
      }
    });

    this.eventEmitter.on("credit-rider", async (data) => {
      const { riderId: merchantId, amount } = data;

      try {
        const wallet = await walletService.getWalletByMerchantId({
          merchantId,
          selectFields: "_id merchantId",
        });
        await walletService.creditWallet({ walletId: wallet?._id, amount });
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
      }
    });
  }

  emit(eventName: string, message: any) {
    console.log({ eventMessage: message });
    this.eventEmitter.emit(eventName, message);
  }
}

export const emitEvent = new  EventEmit();