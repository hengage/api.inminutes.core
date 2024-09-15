import {
  formatPhoneNumberforDB,
  HandleException,
  STATUS_CODES,
} from "../../../utils";
import {
  ICreateCustomerData,
  ICustomerDocument,
  IUpdateCustomerProfile,
} from "../customers.interface";
import { Customer } from "../models/customers.model";

/**
 * A repository class that handles customer-related database operations.
 * @class
 */
export class CustomersRepository {
  async checkEmailIstaken(email: string) {
    const customer = await Customer.findOne({ email }).select("email").lean();

    if (customer) {
      throw new HandleException(STATUS_CODES.CONFLICT, "Email already taken");
    }

    return;
  }

  async checkPhoneNumberIstaken(phoneNumber: string) {
    const customer = await Customer.findOne({ phoneNumber })
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

  /**
    @async
    Creates a new customer account.
    @param {ICreateCustomerData} createCustomerData - The data to create a new customer.
  **/
  async signup(
    createCustomerData: ICreateCustomerData
  ): Promise<Partial<ICustomerDocument>> {
    const formattedPhoneNumber = formatPhoneNumberforDB(
      createCustomerData.phoneNumber
    );
    const customer = new Customer({
      ...createCustomerData,
      phoneNumber: formattedPhoneNumber,
    });

    await customer.save();

    return {
      _id: customer._id,
      phoneNumber: customer.phoneNumber,
    };
  }

  /**
    @async
    Retrieves a customer's profile information.
    @param {string} _id - The ID of the customer to retrieve.
  **/
  async getProfile(_id: string) {
    const customer = await Customer.findById(_id)
      .select("-password -createdAt -__v -updatedAt")
      .lean()
      .exec();
    if (!customer) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Customer not found");
    }

    return customer;
  }

  /**
   *  @async
   *  Updates the profile information for a customer.
   * @param customerId - The ID of the customer.
   * @param customerData -  The new profile data for the customer.
   */
  async updateProfile(
    customerId: string,
    customerData: IUpdateCustomerProfile
  ): Promise<Partial<ICustomerDocument>> {
    const select = [...Object.keys(customerData), "-_id"];

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: customerData },
      { new: true, select }
    );

    if (!customer) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Customer not found");
    }
    return customer;
  }

  /**
   *@async
   *Updates a customer's display photo.
   * @param customerId - The ID of the customer to update.
   * @param displayPhoto - The new display photo URL.
   */
  async updateDIsplayPhoto(customerId: string, displayPhoto: string) {
    const customer = Customer.findByIdAndUpdate(
      customerId,
      { $set: { displayPhoto } },
      { new: true }
    ).select("displayPhoto");

    return customer;
  }

  /**
    @async
    Updates a customer's delivery address and coordinates.
    @param {string} params.customerId - The ID of the customer to update.
    @param {string} params.address - The new delivery address.
    @param {number[]} params.coordinates - The new delivery address coordinates (latitude and longitude).
  */
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

  /**
    @async
    Deletes a customer document from the database.
  */
  async deleteAccount(customerId: string) {
    const result = await Customer.deleteOne({ _id: customerId });

    if (result.deletedCount === 0) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Customer not found");
    }

    console.log("Customer deleted successfully", customerId);
  }
}
