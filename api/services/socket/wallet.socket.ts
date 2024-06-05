import { Socket } from "socket.io";
import { walletService } from "../../features/wallet";

function listenToWalletEvents(socket: Socket) {
  socket.on("get-cashout-accounts", async (message) => {
    try {
      console.log({ message });
      const { merchant, merchantId } = message;
      const cashoutAccounts = await walletService.getCashoutAccounts(
        merchant,
        merchantId
      );
      socket.emit('fetched-cashout-accounts', cashoutAccounts);
    } catch (error: any) {
      socket.emit("get-cashout-accounts-error", error.message);
    }
  });
}

export { listenToWalletEvents };
