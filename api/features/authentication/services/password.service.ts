import { redisClient, UsersService } from "../../../services";
import { HandleException, STATUS_CODES, compareValues } from "../../../utils";

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
    const account = await (AccountModel as any)
      .findOne({ phoneNumber })
      .select("phoneNumber password");
    if (!account) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "User not found");
    }

    const uuidToken = await redisClient.get(`password-reset:${phoneNumber}`);

    if(uuidToken !== token) {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, 'Unauthorized operation');
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
      const AccountModel = await this.usersService.getUserAccountModel(
        accountType
      );
      const account = await (AccountModel as any)
        .findById(accountId)
        .select("password");

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
