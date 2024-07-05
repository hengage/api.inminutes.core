import { Socket } from "socket.io";
import { walletService } from "../../features/wallet";

function listenToWalletEvents(socket: Socket) {
  socket.on("get-cashout-accounts", async (message) => {
    try {
      console.log({ message });
      const cashoutAccounts = await walletService.getCashoutAccounts(
        socket.data.user?._id
      );
      socket.emit("fetched-cashout-accounts", cashoutAccounts);
    } catch (error: any) {
      socket.emit("get-cashout-accounts-error", error.message);
    }
  });

  socket.on("get-wallet-balance", async () => {
    try {
      console.log({ merchantIdInSocket: socket.data.user?._id });
      const balance = await walletService.getBalance(socket.data.user?._id);
      socket.emit("wallet-balance", balance);
    } catch (error: any) {
      socket.emit("get-wallet-balance-error", error.message);
      console.error(error);
    }
  });

  socket.on("wallet-balance", async (message) => {
    try {
      console.log({ message });
    } catch (error: any) {
      console.error({ error });
    }
  });
}
export { listenToWalletEvents };
