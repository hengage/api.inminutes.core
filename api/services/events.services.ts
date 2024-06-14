import { EventEmitter } from "events";
import { walletRepo, walletService } from "../features/wallet";
import { NotificationService } from "../features/notifications";

const eventEmitter = new EventEmitter();
const notificationService = new NotificationService()

export const emitEvent = (eventName: string, message: any) => {
  console.log({ eventMessage: message });

  eventEmitter.emit(eventName, message);
};

eventEmitter.on("create-wallet", async (data) => {
  console.log({ eventData: data });

  try {
    const wallet = await walletRepo.create(data);
    console.log("Created wallet", wallet);
  } catch (error: any) {
    console.log({ error });
  }
});

eventEmitter.on("notify-vendor-of-new-order", async (data) => {
  const { orderId, vendorId } = data;

  try {
    notificationService.createNotification({
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

eventEmitter.on("credit-vendor", async (data) => {
  console.log({ data });
  const { vendorId, amount } = data;
  await walletService.creditVendor({ vendorId, amount });
});

eventEmitter.on("credit-rider", async (data) => {
  const { riderId, amount } = data;
  await walletService.creditRider({ riderId, amount });
});
