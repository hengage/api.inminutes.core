import { usersService } from "../../../services";
import { ICustomer } from "../customers.interface";
import { Customer } from "../models/customers.model";

class CustomersRepository {
  // async signup(payload: any): Promise<Partial<ICustomer>> {
  async signup(
    payload: any
  ): Promise<{ _id: ICustomer["_id"]; phoneNumber: ICustomer["phoneNumber"] }> {
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
}

export const customersRepo = new CustomersRepository();
