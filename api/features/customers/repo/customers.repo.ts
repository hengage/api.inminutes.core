import { usersService } from "../../../services";
import { HandleException, STATUS_CODES } from "../../../utils";
import { ICustomerDocument } from "../customers.interface";
import { Customer } from "../models/customers.model";

class CustomersRepository {
  async signup(payload: any): Promise<Partial<ICustomerDocument>> {
    const {
      fullName,
      displayName,
      phoneNumber,
      email,
      password,
      dateOfBirth,
      address,
    } = payload;

    await usersService.isPhoneNumberTaken(phoneNumber);
    await usersService.isEmailTaken(email);

    const customer = await new Customer({
      fullName,
      displayName,
      phoneNumber,
      email,
      password,
      dateOfBirth,
      address,
    }).save();

    return {
      _id: customer._id,
      phoneNumber: customer.phoneNumber,
    };
  }

  async getProfile(_id: string) {
    const customer = await Customer.findById(_id)
      .select("-password -createdAt -__v -updatedAt")
      .lean()
      .exec();
    console.log({ customer });
    if (!customer) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Customer not found");
    }

    return customer;
  }
}

export const customersRepo = new CustomersRepository();
