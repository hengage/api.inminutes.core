import { EventEmitter } from "events";
import { walletRepo } from "../features/wallet";
import { notificationService } from "../features/notifications";

const eventEmitter = new EventEmitter();

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
    console.error({error});
  }
});
