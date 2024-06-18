import { ClientSession } from "mongoose";
import { convertLatLngToCell, emitEvent } from "../../../services";
import {
  HandleException,
  STATUS_CODES,
  calculateAverageRating,
  compareValues,
} from "../../../utils";
import { Vendor } from "../models/vendors.model";
import { vendorsService } from "../services/vendor.services";
import { IVendorDocument, IVendorSignup } from "../vendors.interface";
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
    coordinates: [lng: number, lat: number];
    page: number;
    limit: number;
  }) {
    const { coordinates, page, limit } = params;

    // const origin = convertLatLngToCell(coordinates);
    // const query = { h3Index: origin };

    const query = {
      location: {
        $near: {
          $geometry: { type: "Point", coordinates },
          $maxDistance: 17000,
        },
      },
    };

    const docs = await Vendor.find(query).select({
      businessName: 1,
      businessLogo: 1,
      location: {
        coordinates: 1,
      },
      category: 1,
      address: 1,
      rating: {
        averageRating: 1,
      },
    });

    const totalDocs = docs.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const vendors = {
      docs,
      totalDocs,
      limit,
      totalPages,
      page,
      hasNextPage,
      hasPrevPage,
    };
    return vendors;
  }

  async changeH3IndexResolution() {
    const vendors = await Vendor.find();
    vendors.forEach(async (vendor) => {
      vendor.h3Index = convertLatLngToCell(vendor.location.coordinates);
      await vendor.save();
      console.log("changed vendor location");
    });
  }

  async getVendorsByCategory(params: {
    categoryId: string;
    page: number;
    coordinates: [lng: number, lat: number];
  }) {
    const { categoryId, coordinates, page } = params;
    const limit = 20;
    // const origin = convertLatLngToCell(params.coordinates);
    // const query = { category: params.categoryId, h3Index: origin };

    const query = {
      category: categoryId,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates },
          $maxDistance: 17000,
        },
      },
    };

    const docs = await Vendor.find(query)
      .select({
        businessName: 1,
        businessLogo: 1,
        location: {
          coordinates: 1,
        },
        category: 1,
        address: 1,
        rating: {
          averageRating: 1,
        },
      })
      .lean()
      .exec();

    const totalDocs = docs.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const vendors = {
      docs,
      totalDocs,
      limit,
      totalPages,
      page,
      hasNextPage,
      hasPrevPage,
    };
    return vendors;
  }

  async getVendorsBySubCategory(params: {
    subCategoryId: string;
    page: number;
    coordinates: [lng: number, lat: number];
  }) {
    const { page, coordinates } = params;
    const limit = 20;

    // const origin = convertLatLngToCell(params.coordinates);
    // const query = { subCategory: params.subCategoryId,  h3Index: origin };

    const query = {
      subCategory: params.subCategoryId,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates },
          $maxDistance: 17000,
        },
      },
    };

    const docs = await Vendor.find(query).select({
      businessName: 1,
      businessLogo: 1,
      location: { coordinates: 1 },
      // category: 1,
      address: 1,
      rating: {
        averageRating: 1,
      },
    });

    const totalDocs = docs.length;
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const vendors = {
      docs,
      totalDocs,
      limit,
      totalPages,
      page,
      hasNextPage,
      hasPrevPage,
    };

    return vendors;
  }

  async updateRating(
    updateRatingDto: { vendorId: string; rating: number },
    session: ClientSession
  ) {
    const { vendorId, rating } = updateRatingDto;
    try {
      const vendor = await Vendor.findOne({
        _id: vendorId,
      }).select("rating");

      if (!vendor) {
        throw new HandleException(STATUS_CODES.NOT_FOUND, "vendor not found");
      }

      vendor.rating.averageRating = calculateAverageRating(vendor, rating);

      await vendor.save({ session });
    } catch (error: any) {
      throw new HandleException(error.status, error.message);
    }
  }
}

export const vendorsRepo = new VendorsRepository();
