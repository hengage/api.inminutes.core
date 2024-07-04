import { ClientSession } from "mongoose";
import { convertLatLngToCell, emitEvent } from "../../../services";
import {
  HandleException,
  STATUS_CODES,
  calculateAverageRating,
  compareValues,
} from "../../../utils";
import { Vendor } from "../models/vendors.model";
import { IVendorDocument, IVendorSignupData } from "../vendors.interface";

/**
Repository for managing vendors.
@class
*/
class VendorsRepository {
  /**
   @async
  Creates new vendor account.
  @param {object} vendorData - The vendor signup data.
  */
  async signup(
    vendorData: IVendorSignupData
  ): Promise<Partial<IVendorDocument>> {
    const vendor = await Vendor.create({
      ...vendorData,
      location: {
        coordinates: vendorData.location,
      },
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

  /**
    @async
    Retrieves vendors by location coordinates.
    @param {number[]} params.coordinates - The location coordinates (longitude and latitude) to search around.
    @param {number} params.page - The page number to retrieve.
    @param {number} params.limit - The number of vendors to retrieve per page.
  */
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

  /**
    @async
    Retrieves a list of vendors by category and location coordinates.
    @param {string} params.categoryId - The ID of the category to filter by.
    @param {number} params.page - The page number to retrieve.
    @param {number[]} params.coordinates - The location coordinates (longitude and latitude) to search around.
  */
  async getVendorsByCategory(params: {
    categoryId: string;
    page: number;
    coordinates: [lng: number, lat: number];
  }) {
    const { categoryId, coordinates, page } = params;
    const limit = 20;

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

  /**
   @async
  Retrieves a list of vendors by sub-category and location coordinates.
  @param {string} params.subCategoryId - The ID of the sub-category to filter by.
  @param {number[]} params.coordinates - The location coordinates (longitude and latitude) to search around.
  @param {number} params.page - The page number to retrieve.
  */
  async getVendorsBySubCategory(params: {
    subCategoryId: string;
    coordinates: [lng: number, lat: number];
    page: number;
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

    const docs = await Vendor.find(query)
      .select({
        businessName: 1,
        businessLogo: 1,
        location: { coordinates: 1 },
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

  /**
  Updates a vendor's rating.
  @param {string} updateRatingDto.vendorId - The ID of the vendor to update.
  @param {number} updateRatingDto.rating - The new rating value.
  @param {ClientSession} session - The database session.
*/
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
