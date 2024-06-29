import { walletService } from "./wallet.service";
import { NotificationService } from "../../notifications";
import mongoose from "mongoose";
require("leaked-handles")


// jest.mock('"../../notifications/services/notification.service')
describe("test wallet service", () => {
  afterAll(async() => {
   await   mongoose.connection.close();
  })

  test.only("it calls creditvendor method correctly", async () => {
    jest.spyOn(walletService, "creditWallet").mockResolvedValue();

    // walletService.creditVendor = jest.fn();
    await walletService.creditWallet({ walletId: "123", amount: "4000" });

    expect(walletService.creditWallet).toHaveBeenCalledTimes(1);
    expect(walletService.creditWallet).toHaveBeenCalledWith({
      vendorId: "123",
      amount: "4000",
    });
    jest.resetAllMocks();
  });
});
