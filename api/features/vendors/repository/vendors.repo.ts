import { ClientSession, startSession } from "mongoose";
import {
  ACCOUNT_STATUS,
  GEOLOCATION,
  HTTP_STATUS_CODES,
  USER_APPROVAL_STATUS,
  USER_TYPE,
} from "../../../constants";
import { Coordinates } from "../../../types";
import {
  calculateAverageRating,
  compareValues,
  formatPhoneNumberforDB,
  HandleException,
  Msg,
} from "../../../utils";
import { walletRepo } from "../../wallet";
import { Vendor } from "../models/vendors.model";
import { IVendorDocument, IVendorSignupData } from "../vendors.interface";

class VendorsRepository {
  async signup(
    vendorData: IVendorSignupData
  ): Promise<Partial<IVendorDocument>> {
    const session = await startSession();

    try {
      return await session.withTransaction(async () => {
        const vendor = new Vendor({
          ...vendorData,
          phoneNumber: formatPhoneNumberforDB(vendorData.phoneNumber),
          location: {
            coordinates: vendorData.location,
          },
          approvalStatus: USER_APPROVAL_STATUS.PENDING,
        });

        await vendor.save({ session });

        await walletRepo.create(
          {
            merchantId: vendor._id,
            merchantType: USER_TYPE.VENDOR,
          },
          session
        );

        return {
          _id: vendor._id,
          businessName: vendor.businessName,
          businessLogo: vendor.businessLogo,
          email: vendor.email,
          phoneNumber: vendor.phoneNumber,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  async login(email: string, password: string) {
    const vendor = await Vendor.findOne({ email }).select(
      "email phoneNumber password"
    );

    if (!vendor) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_INVALID_LOGIN_CREDENTIALS()
      );
    }

    const passwordsMatch = await compareValues(password, vendor.password);
    if (!passwordsMatch) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_INVALID_LOGIN_CREDENTIALS()
      );
    }

    if (
      vendor.approvalStatus != USER_APPROVAL_STATUS.APPROVED ||
      vendor.accountStatus != ACCOUNT_STATUS.ACTIVE
    ) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_ACTIVE()
      );
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
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_VENDOR_NOT_FOUND(id)
      );
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
    coordinates: Coordinates;
    page: number;
    limit: number;
  }) {
    const { coordinates, page, limit } = params;

    const query = {
      location: {
        $near: {
          $geometry: { type: GEOLOCATION.POINT, coordinates },
          $maxDistance: GEOLOCATION.MAX_DISTANCE_TO_SEARCH,
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
    coordinates: Coordinates;
  }) {
    const { categoryId, coordinates, page } = params;
    const limit = 20;

    const query = {
      category: categoryId,
      location: {
        $near: {
          $geometry: { type: GEOLOCATION.POINT, coordinates },
          $maxDistance: GEOLOCATION.MAX_DISTANCE_TO_SEARCH,
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
    coordinates: Coordinates;
    page: number;
  }) {
    const { page, coordinates } = params;
    const limit = 20;

    const query = {
      subCategory: params.subCategoryId,
      location: {
        $near: {
          $geometry: { type: GEOLOCATION.POINT, coordinates },
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
        throw new HandleException(
          HTTP_STATUS_CODES.NOT_FOUND,
          Msg.ERROR_VENDOR_NOT_FOUND(vendorId)
        );
      }

      vendor.rating.averageRating = calculateAverageRating(vendor, rating);

      await vendor.save({ session });
    } catch (error: unknown) {
      throw error;
    }
  }
}

export const vendorsRepo = new VendorsRepository();
