import { HandleException, STATUS_CODES } from "../../../utils";
import { Product } from "../../products";
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

  async getProducts(vendorId: string, page: number) {
    const query = { vendor: vendorId };

    const options = {
      page,
      limit: 20,
      select: "name image cost",
      leanWithId: false,
      lean: true,
    };

    const products = await Product.paginate(query, options);
    return products;
  }
}

export const vendorsService = new VendorsService();
