import { HandleException, STATUS_CODES } from "../../../utils";
import { mediaService } from "../../media";
import { Customer } from "../models/customers.model";
import { customersRepo } from "../repo/customers.repo";

class CustomersService {
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

  async updateProfilePhoto(params: {
    customerId: string;
    image: Record<string, any>;
  }) {
    const { customerId, image } = params;
    const displayPhotoUrl = await mediaService.uploadToCloudinary(
      image,
      "display-photo"
    );
    console.log({ displayPhotoUrl });

    const updatedCustomer = await Promise.all(
      Object.values(displayPhotoUrl).map(async (url) => {
        const customer = await customersRepo.updateDIsplayPhoto(customerId, url);
        return customer;
      })
    );

    return updatedCustomer;
  }
}

export const customersService = new CustomersService();
