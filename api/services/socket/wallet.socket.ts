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

  socket.on('get-vendor-wallet-balance', async (message) => {
    try {
      const balance = await walletService.getVendorBalance(message.vendorId)
      socket.emit('vendor-wallet-balance', balance)
    } catch (error: any) {
      socket.emit('get-vendor-wallet-balance-error', error.message);
      console.error(error);
    }
  })
  
  socket.on('get-rider-wallet-balance', async (message) => {
    console.log({message})
    try {
      const balance = await walletService.getRiderBalance(message.riderId)
      socket.emit('rider-wallet-balance', balance)
    } catch (error: any) {
      socket.emit('get-rider-wallet-balance-error', error.message);
      console.error(error);
    }
  })


}

export { listenToWalletEvents };
