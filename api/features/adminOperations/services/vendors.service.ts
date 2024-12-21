import { PaginateResult, FilterQuery } from "mongoose";
import { IVendorDocument, Vendor } from "../../vendors";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES } from "../../../constants";
import { HandleException, Msg } from "../../../utils";
import { buildFilterQuery, createPaginationOptions } from "../../../utils/db.utils";
import { Product } from "../../products";

export class AdminOpsVendorsService {
  private vendorModel = Vendor;
  private productModel = Product;

  async getAllVendors(
    page = 1,
    filter: GetVendorsFilter,
  ): Promise<PaginateResult<IVendorDocument>> {

    const options = createPaginationOptions(page, { select: "_id businessName businessLogo" });

    const filterQuery: FilterQuery<IVendorDocument> = {};
    if (filter) {
      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(filter).filter(([_, v]) => v !== undefined),
      );

      const searchFields = ["businessName", "email", "phoneNumber"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
    }

    const vendors = await this.vendorModel.paginate(filterQuery, options);
    return vendors;
  }

  async getVendor(vendorId: string): Promise<IVendorDocument> {
    const vendor = await this.vendorModel
      .findById(vendorId)
      .select("-updatedAt -__v -password")
      .lean()
      .exec();

    if (!vendor) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        "Vendor not found",
      );
    }

    return vendor;
  }

  /**
   * Updates vendor account status
   * @param vendorId - The vendor's ID
   * @param status - New account status
   */
  async setAccountStatus(
    vendorId: IVendorDocument["_id"],
    status: ACCOUNT_STATUS,
  ): Promise<void> {
    const vendor = await this.vendorModel
      .findById(vendorId)
      .select("_id businessName accountStatus");
    if (!vendor) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_VENDOR_NOT_FOUND(vendorId),
      );
    }
    vendor.accountStatus = status;
    await vendor.save();
  }

  // Approve or disapprove vendor
  async setApprovalStatus(
    vendorId: IVendorDocument["_id"],
    approved: boolean,
  ): Promise<void> {
    const vendor = await this.vendorModel
      .findById(vendorId)
      .select("_id approved");
    if (!vendor) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_VENDOR_NOT_FOUND(vendorId),
      );
    }
    vendor.approved = approved;
    await vendor.save();
  }

  async productMetrics(
    vendorId: IVendorDocument["_id"],
  ): Promise<ProductMetrics> {
    const metrics = await this.productModel.aggregate([
      { $match: { vendor: vendorId } },
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          total: [{ $count: "total" }],
        },
      },
    ]);

    // Transform results into required format
    const statusCounts = metrics[0].byStatus.reduce(
      (acc: Record<string, number>, curr: { _id: string; count: number }) => {
        acc[curr._id.toLowerCase()] = curr.count;
        return acc;
      },
      {},
    );

    return {
      pendingProducts: statusCounts.pending || 0,
      approvedProducts: statusCounts.approved || 0,
      rejectedProducts: statusCounts.rejected || 0,
      totalProducts: metrics[0].total[0].total,
    };
  }
}

interface GetVendorsFilter {
  accountStatus?: ACCOUNT_STATUS;
  category?: string;
  subCategory?: string;
  searchQuery: string;
}

interface ProductMetrics {
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  totalProducts: number;
}
