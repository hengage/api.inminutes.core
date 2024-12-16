import { redisClient, UsersService } from "../../../services";
import { HandleException, Msg, compareValues } from "../../../utils";
import { HTTP_STATUS_CODES } from "../../../constants";

class PasswordService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }
  async resetPassword(passwordResetData: {
    phoneNumber: string;
    newPassword: string;
    token: string;
    accountType: string;
  }) {
    const { phoneNumber, newPassword, token, accountType } = passwordResetData;

    const AccountModel = await this.usersService.getUserAccountModel(
      accountType
    );
    const account = await (AccountModel as unknown as typeof AccountModel.prototype)
      .findOne({ phoneNumber })
      .select("phoneNumber password");
    if (!account) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NO_USER_FOUND_WITH_PHONE_NUMBER(phoneNumber),
      );
    }

    const uuidToken = await redisClient.get(`password-reset:${phoneNumber}`);

    if (uuidToken !== token) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, 'Unauthorized operation');
    }

    account.password = newPassword;

    await account.save();
  }

  public async changePassword(
    accountId: string,
    currentPassword: string,
    newPassword: string,
    accountType: string,
  ) {
    try {
      const AccountModel = await this.usersService.getUserAccountModel(
        accountType
      );
      const account = await (AccountModel as unknown as typeof AccountModel.prototype)
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
      await account.save();
      return;
    } catch (error: unknown) {
      if (error instanceof HandleException) {
        throw error;
      }
      throw new HandleException(HTTP_STATUS_CODES.SERVER_ERROR, Msg.ERROR_UNKNOWN_ERROR());
    }
  }
}

export const passwordService = new PasswordService();
