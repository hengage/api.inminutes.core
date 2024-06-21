import { Socket } from "socket.io";
import { walletService } from "../../features/wallet";

function listenToWalletEvents(socket: Socket) {
  socket.on("get-cashout-accounts", async (message) => {
    try {
      console.log({ message });
      const { merchant } = message;
      const cashoutAccounts = await walletService.getCashoutAccounts(
        merchant,
        socket.data.user?._id
      );
      socket.emit("fetched-cashout-accounts", cashoutAccounts);
    } catch (error: any) {
      socket.emit("get-cashout-accounts-error", error.message);
    }
  });

  socket.on("get-vendor-wallet-balance", async () => {
    try {
      const balance = await walletService.getVendorBalance(
        socket.data.user?._id
      );
      socket.emit("vendor-wallet-balance", balance);
    } catch (error: any) {
      socket.emit("get-vendor-wallet-balance-error", error.message);
      console.error(error);
    }
  });

  socket.on("get-rider-wallet-balance", async () => {
    try {
      const balance = await walletService.getRiderBalance(
        socket.data.user?._id
      );
      socket.emit("rider-wallet-balance", balance);
    } catch (error: any) {
      socket.emit("get-rider-wallet-balance-error", error.message);
      console.error(error);
    }
  });
}

export { listenToWalletEvents };
