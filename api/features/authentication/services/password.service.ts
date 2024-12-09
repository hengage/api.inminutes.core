import { HTTP_STATUS_CODES } from "../../../constants";
import { UsersService } from "../../../services";
import { HandleException, compareValues, Msg } from "../../../utils";

class PasswordService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService()
  }
  async resetPassword(
    phoneNumber: string,
    newPassword: string,
    accountType: string
  ) {
    const AccountModel = await this.usersService.getUserAccountModel(accountType);
    const account = await (AccountModel as any).findOne({ phoneNumber }).select("phoneNumber password");
    if (!account) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NO_USER_FOUND_WITH_PHONE_NUMBER(phoneNumber)
      );
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
      const AccountModel = await this.usersService.getUserAccountModel(accountType);
      const account = await (AccountModel as any).findById(accountId).select("password");

      if (!account) {
        throw new HandleException(
          HTTP_STATUS_CODES.NOT_FOUND,
          Msg.ERROR_NO_USER_FOUND(accountId)
        );
      }

      const currentPasswordMatch = await compareValues(
        currentPassword,
        account.password
      );

      if (!currentPasswordMatch) {
        throw new HandleException(
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid current password"
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
