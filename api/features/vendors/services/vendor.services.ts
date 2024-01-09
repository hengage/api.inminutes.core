import { HandleException, STATUS_CODES } from "../../../utils";
import { Vendor } from "../models/vendors.model";

class VendorsService {
  async checkBusinnessNameIstaken(businessName: string) {
    const vendor = await Vendor.findOne({ businessName })
      .select("businessName")
      .lean();

    if (vendor) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "Business name already taken. Contact admin if this is your business name"
      );
    }

    return;
  }
}

export const vendorsService = new VendorsService();
