import { walletService } from "./wallet.service";
import { notificationService } from "../../notifications";
import mongoose from "mongoose";
require("leaked-handles")


// jest.mock('"../../notifications/services/notification.service')
describe("test wallet service", () => {
  afterAll(async() => {
   await   mongoose.connection.close();
  })

  test.only("it calls creditvendor method correctly", async () => {
    jest.spyOn(walletService, "creditVendor").mockResolvedValue();

    // walletService.creditVendor = jest.fn();
    await walletService.creditVendor({ vendorId: "123", amount: "4000" });

    expect(walletService.creditVendor).toHaveBeenCalledTimes(1);
    expect(walletService.creditVendor).toHaveBeenCalledWith({
      vendorId: "123",
      amount: "4000",
    });
    jest.resetAllMocks();
  });
});
