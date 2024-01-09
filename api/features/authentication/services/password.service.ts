import {  usersService } from "../../../services";
import { HandleException, STATUS_CODES, compareValues } from "../../../utils";

class PasswordService {
  async resetPassword(
    phoneNumber: string,
    newPassword: string,
    accountType: string
  ) {
    const AccountModel = await usersService.getUserAccountModel(accountType);
    const account = await (AccountModel as any).findOne({ phoneNumber }).select("phoneNumber password");
    if (!account) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "User not found");
    }

    account.password = newPassword;
    account.save();
  }

  public async changePassword(
    accountId: string,
    currentPassword: string,
    newPassword: string,
    accountType: string
  ) {
    try {
      const AccountModel = await usersService.getUserAccountModel(accountType);
      const account = await (AccountModel as any).findById(accountId).select("password");

      if (!account) {
        throw new HandleException(STATUS_CODES.NOT_FOUND, "User not found");
      }

      const currentPasswordMatch = await compareValues(
        currentPassword,
        account.password
      );

      if (!currentPasswordMatch) {
        throw new HandleException(
          STATUS_CODES.BAD_REQUEST,
          "Your current password is incorrect"
        );
      }
      account.password = newPassword;
      account.save();
      return;
    } catch (error: any) {
      throw new HandleException(error.status, error.message);
    }
  }
}

export const passwordService = new PasswordService();
