import { HandleException, STATUS_CODES } from "../../../utils";
import { Customer } from "../models/customers.model";

class CustomersService {
  async checkEmailIstaken(email: string) {
    const customer = await Customer.findOne({ email })
      .select('email')
      .lean();

    if (customer) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "Email already taken"
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
