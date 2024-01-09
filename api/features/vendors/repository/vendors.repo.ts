import { Vendor } from "../models/vendors.model";

class VendorsRepository {
  async signup(payload: any) {
    const {
      businessName,
      businessLogo,
      email,
      phoneNumber,
      password,
      address,
      location,
    } = payload;

    const vendor = Vendor.create({
      businessName,
      businessLogo,
      email,
      phoneNumber,
      password,
      address,
      location: {
        coordinates: location,
      },
    });

    return vendor;
  }
}

export const vendorsRepo = new VendorsRepository()