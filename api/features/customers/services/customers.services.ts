import { HandleException, STATUS_CODES } from "../../../utils";
import { Customer } from "../models/customers.model";

class CustomersService {
  async checkDisplayNameIstaken(displayName: string) {
    const customer = await Customer.findOne({ displayName })
      .select('displayName')
      .lean();

    if (customer) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "Display name already taken"
      );
    }

    return;
  }

  async checkPhoneNumberIstaken(phoneNumber: string) {
    const customer = await Customer.findOne({ phoneNumber })
      .select('phoneNumber')
      .lean();

    if (customer) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        `Looks like you already have a customer account, ` +
        `please try to login instead`
      );
    }

    return;
  }
}

export const customersService = new CustomersService();
