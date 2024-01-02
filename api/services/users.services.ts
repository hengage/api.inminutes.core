import { Customer } from "../features/customers";
import { Vendor } from "../features/vendors";
import { HandleException, STATUS_CODES } from "../utils";

class UsersService {
  public async isEmailTaken(email: string) {
    const customer = await Customer.findOne({
      email: { $eq: email },
    })
      .select("email")
      .lean()
      .exec();

    const vendor = await Vendor.findOne({
      email: { $eq: email },
    })
      .select("email")
      .lean()
      .exec();

    if (customer || vendor) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "Email is already taken"
      );
    }

    return false; // Email is not taken
  }

  public async isPhoneNumberTaken(phoneNumber: string) {
    const customer = await Customer.findOne({
      phoneNumber: { $eq: phoneNumber },
    })
      .select("phoneNumber")
      .lean()
      .exec();

    const vendor = await Vendor.findOne({
      phoneNumber: { $eq: phoneNumber },
    })
      .select("phoneNumber")
      .lean()
      .exec();

    if (customer || vendor) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "Phone number is already taken"
      );
    }
    return false;
  }

  public async getUserAccountModel(accountType: string) {
    switch (accountType) {
      case "customer":
        return Customer;
      // case "vendor":
      //   return Vendor;
      // case "rider":
      //   return DriverRider;
      default:
        throw new HandleException(
          STATUS_CODES.BAD_REQUEST,
          "Invalid account type"
        );
    }
  }
}

export const usersService = new UsersService();
