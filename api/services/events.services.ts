import { EventEmitter } from "events";
import { walletRepo } from "../features/wallet";

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
