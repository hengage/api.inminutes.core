import { Customer } from "../features/customers";
import { Rider } from "../features/riders";
import { Vendor } from "../features/vendors";
import { HandleException, HTTP_STATUS_CODES } from "../utils";

export class UsersService {
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

    const rider = await Rider.findOne({
      email: { $eq: email },
    })
      .select("email")
      .lean()
      .exec();

    if (customer || vendor || rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
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

    const rider = await Rider.findOne({
      phoneNumber: { $eq: phoneNumber },
    })
      .select("email")
      .lean()
      .exec();

    if (customer || vendor || rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        "Phone number is already taken"
      );
    }
    return false;
  }

  public async isDisplayNameTaken(displayName: string) {
    const customer = await Customer.findOne({
      displayName: { $eq: displayName },
    })
      .select("displayName")
      .lean()
      .exec();

    const rider = await Rider.findOne({
      displayName: { $eq: displayName },
    })
      .select("displayName")
      .lean()
      .exec();

    if (customer || rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        "Display name is already taken"
      );
    }
    return false;
  }

  public async getUserAccountModel(accountType: string) {
    switch (accountType) {
      case "customer":
        return Customer;
      case "vendor":
        return Vendor;
      case "rider":
        return Rider;
      default:
        throw new HandleException(
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid account type"
        );
    }
  }
}