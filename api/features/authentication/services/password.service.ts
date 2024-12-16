import { HTTP_STATUS_CODES } from "../../../constants";
import { UsersService } from "../../../services";
import { AccountModelType } from "../../../types";
import { HandleException, compareValues, Msg } from "../../../utils";

class PasswordService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }
  async resetPassword(
    phoneNumber: string,
    newPassword: string,
    accountType: string,
  ) {
    const AccountModel =
      await this.usersService.getUserAccountModel(accountType);
    const account = await (AccountModel as AccountModelType)
      .findOne({ phoneNumber })
      .select("phoneNumber password");
    if (!account) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NO_USER_FOUND_WITH_PHONE_NUMBER(phoneNumber),
      );
    }

    account.password = newPassword;
    account.save();
  }

  public async changePassword(
    accountId: string,
    currentPassword: string,
    newPassword: string,
    accountType: string,
  ) {
    try {
      const AccountModel =
        await this.usersService.getUserAccountModel(accountType);
      const account = await (AccountModel as AccountModelType)
        .findById(accountId)
        .select("password");

      if (!account) {
        throw new HandleException(
          HTTP_STATUS_CODES.NOT_FOUND,
          Msg.ERROR_NO_USER_FOUND(accountId),
        );
      }

      const currentPasswordMatch = await compareValues(
        currentPassword,
        account.password,
      );

      if (!currentPasswordMatch) {
        throw new HandleException(
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid current password",
        );
      }
      account.password = newPassword;
      account.save();
      return;
    } catch (error: unknown) {
      if (error instanceof HandleException) {
        throw error;
      }
      throw new HandleException(
        HTTP_STATUS_CODES.SERVER_ERROR,
        Msg.ERROR_UNKNOWN_ERROR()
      );
    }
  }
}

export const passwordService = new PasswordService();
