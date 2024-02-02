import { convertLatLngToCell, emitEvent } from "../../../services";
import { HandleException, STATUS_CODES, compareValues } from "../../../utils";
import { Vendor } from "../models/vendors.model";
import { IVendorDocument, IVendorSignup } from "../vendors.interface";
import h3 from "h3-js";
class VendorsRepository {
  async signup(payload: IVendorSignup): Promise<Partial<IVendorDocument>> {
    const {
      businessName,
      businessLogo,
      email,
      phoneNumber,
      password,
      address,
      location,
      residentialAddress,
      category,
      subCategory,
    } = payload;

    const vendor = await Vendor.create({
      businessName,
      businessLogo,
      email,
      phoneNumber,
      password,
      address,
      location: {
        coordinates: location,
      },
      h3Index: convertLatLngToCell(location),
      residentialAddress,
      category,
      subCategory,
    });

    emitEvent("create-wallet", {
      vendorId: vendor._id,
    });

    return {
      _id: vendor._id,
      businessName: vendor.businessName,
      businessLogo: vendor.businessLogo,
      email: vendor.email,
      phoneNumber: vendor.phoneNumber,
    };
  }

  async login(email: string, password: string) {
    const vendor = await Vendor.findOne({ email }).select(
      "email phoneNumber password"
    );

    if (!vendor) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Invalid credentials");
    }

    const passwordsMatch = await compareValues(password, vendor.password);
    if (!passwordsMatch) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Invalid credentials");
    }

    return {
      _id: vendor._id,
      phoneNumber: vendor.phoneNumber,
    };
  }

  async getMe(id: string): Promise<IVendorDocument> {
    const vendor = await Vendor.findById(id)
      .select("-updatedAt -password -accountStatus -location -__v")
      .lean();

    if (!vendor) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Vendor not found");
    }

    return vendor;
  }

  async findVendorsByLocation(params: {
    coordinates: [lng: number, lat: number]
    page: number,
    limit: number}
  ) {
    const {coordinates, page, limit} = params;
    
    const origin = convertLatLngToCell(coordinates);
    const query = { h3Index: origin };

    const options = {
      page,
      limit,
      select:  {
        "businessName": 1,
        "businessLogo": 1,
        "location": {
          "coordinates": 1,
        },
        "category": 1,
        "address": 1,
        "rating": {
          "averageRating": 1,
        },
      },
      leanWithId: false,
      lean: true,
    };

    const vendors = await Vendor.paginate(query, options);
    return vendors
  }

  async changeH3IndexResolution() {
    const vendors = await Vendor.find();
    vendors.forEach(async (vendor) => {
      vendor.h3Index = convertLatLngToCell(vendor.location.coordinates);
      await vendor.save();
      console.log("changed vendor location");
    });
  }
}

export const vendorsRepo = new VendorsRepository();
