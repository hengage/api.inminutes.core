import { HandleException, STATUS_CODES } from "../../../utils";
import {
  ICustomerDocument,
  IUpdateCustomerProfile,
} from "../customers.interface";
import { Customer } from "../models/customers.model";

export class CustomersRepository {
  async checkEmailIstaken(email: string) {
    const customer = await Customer
      .findOne({ email })
      .select("email")
      .lean();

    if (customer) {
      throw new HandleException(STATUS_CODES.CONFLICT, "Email already taken");
    }

    return;
  }

  async checkPhoneNumberIstaken(phoneNumber: string) {
    const customer = await Customer
      .findOne({ phoneNumber })
      .select("phoneNumber")
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

  async signup(payload: any): Promise<Partial<ICustomerDocument>> {
    const {
      fullName,
      displayName,
      phoneNumber,
      email,
      password,
      dateOfBirth,
      deliveryAddress,
    } = payload;

    const customer = new Customer({
      fullName,
      displayName,
      phoneNumber,
      email,
      password,
      dateOfBirth,
      deliveryAddress,
    })
    
    await customer.save();

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

  async updateProfile(customerId: string, payload: IUpdateCustomerProfile) {
    const select = Object.keys(payload);
    select.push("-_id");

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: payload },
      { new: true }
    ).select(select);

    if (!customer) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Customer not found");
    }
    return customer;
  }

  async updateDIsplayPhoto(customerId: string, displayPhoto: string) {
    const customer = Customer.findByIdAndUpdate(
      customerId,
      { $set: { displayPhoto } },
      { new: true }
    ).select("displayPhoto");

    return customer;
  }

  async updateDeliveryAddress(params: {
    customerId: string;
    address: string;
    coordinates: [number, number];
  }) {
    const { customerId, address, coordinates } = params;

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        $set: {
          deliveryAddress: address,
          deliveryAddressCoords: { coordinates },
        },
      },
      {
        new: true,
        fields: ["deliveryAddress", "deliveryAddressCoords.coordinates"],
      }
    );

    if (!customer) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Customer not found");
    }
    return customer;
  }

  async deleteAccount(customerId: string) {
    const result = await Customer.deleteOne({ _id: customerId });

    if (result.deletedCount === 0) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Customer not found");
    }

    console.log("Customer deleted successfully", customerId);
  }
}