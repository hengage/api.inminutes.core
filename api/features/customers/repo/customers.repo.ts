import { usersService } from "../../../services";
import { HandleException, STATUS_CODES } from "../../../utils";
import {
  ICustomerDocument,
  IUpdateCustomerProfile,
} from "../customers.interface";
import { Customer } from "../models/customers.model";
import { customersService } from "../services/customers.services";

class CustomersRepository {
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

    await Promise.all([
      usersService.isDisplayNameTaken(displayName),
      customersService.checkPhoneNumberIstaken(phoneNumber),
      customersService.checkEmailIstaken(email),
    ]);

    const customer = await new Customer({
      fullName,
      displayName,
      phoneNumber,
      email,
      password,
      dateOfBirth,
      deliveryAddress,
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

export const customersRepo = new CustomersRepository();
