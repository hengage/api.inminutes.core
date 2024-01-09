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
}

export const customersService = new CustomersService();
