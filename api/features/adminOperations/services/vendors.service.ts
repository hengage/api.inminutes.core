import { PaginateResult, FilterQuery } from "mongoose";
import { IVendorDocument, Vendor } from "../../vendors";
import { ACCOUNT_STATUS, DB_SCHEMA, HTTP_STATUS_CODES, ORDER_STATUS } from "../../../constants";
import { HandleException, Msg } from "../../../utils";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions } from "../../../utils/db.utils";
import { Product } from "../../products";
import { GetVendorsFilter, ProductMetrics, VendorMetricsRange, VendorMetricsResponse, VendorSummaryResponse } from "../interfaces/vendor.interface";
import { Order } from "../../orders";

export class AdminOpsVendorsService {
  private vendorModel = Vendor;
  private productModel = Product;
  private orderModel = Order;

  async getAllVendors(
    page = 1,
    filter: GetVendorsFilter,
  ): Promise<PaginateResult<IVendorDocument>> {

    const options = createPaginationOptions(page, { select: "_id businessName businessLogo" });

    const filterQuery: FilterQuery<IVendorDocument> = {};
    if (filter) {
      addDateRangeFilter(filterQuery, filter.startDate as string, filter.endDate as string);
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

  async getTopList(
      page = 1,
      filter: GetVendorsFilter,
      limit = 5
  ): Promise<PaginateResult<IVendorDocument>> {
    const options = createPaginationOptions(page, { select: "_id businessName businessLogo" }, limit);

    const filterQuery: FilterQuery<IVendorDocument> = {};
    if (filter) {
      addDateRangeFilter(filterQuery, filter.startDate as string, filter.endDate as string);
      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(filter).filter(([_, v]) => v !== undefined),
      );

      const searchFields = ["businessName", "email", "phoneNumber"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
      }

      const topVendors = await this.orderModel.aggregate([
          {
              $match: { status: ORDER_STATUS.DELIVERED }
          },
          {
              $group: {
                  _id: "$vendor",
                  totalDeliveries: { $sum: 1 }
              }
          },
          { $sort: { totalDeliveries: -1 } },
          {
              $lookup: {
                  from: DB_SCHEMA.VENDOR,
                  localField: "_id",
                  foreignField: "_id",
                  as: "vendorDetails"
              }
          },
          { $unwind: "$vendorDetails" },
          {
              $project: {
                  _id: "$vendorDetails._id",
                  fullName: "$vendorDetails.businessName",
                  email: "$vendorDetails.email",
                  phoneNumber: "$vendorDetails.phoneNumber",
                  totalDeliveries: 1
              }
          }
      ]);

      const vendorIds = topVendors.map(vendor => vendor._id);
      const totalDeliveriesMap = new Map(topVendors.map(c => [c._id.toString(), c.totalDeliveries]));

      const paginatedVendors: PaginateResult<IVendorDocument> = await Vendor.paginate(
          { _id: { $in: vendorIds }, ...filterQuery },
          options
      );

      paginatedVendors.docs = paginatedVendors.docs.map(vendor => {
        const vendorObj = vendor.toObject();
        return {
            ...vendorObj,
            totalDeliveries: totalDeliveriesMap.get(vendor._id.toString()) || 0
        };
    });
      return paginatedVendors;
  }

  async getVendorSummary(): Promise<VendorSummaryResponse> {
      const totalVendors = await Vendor.countDocuments({});

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newVendors = await Vendor.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
      });

      const returningVendors = await this.orderModel.aggregate([
          {
              $group: {
                  _id: "$vendor",
                  orderCount: { $sum: 1 }
              }
          },
          {
              $match: {
                  orderCount: { $gt: 1 }
              }
          },
          {
              $count: "returningVendors"
          }
      ]);

      return {
          totalVendors,
          newVendors,
          returningVendors: returningVendors[0]?.returningVendors || 0
      };
  }

  async getVendorMetrics(data: VendorMetricsRange): Promise<VendorMetricsResponse[]> {
      const vendorMetrics = await Vendor.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte: data.startDate,
                      $lte: data.endDate
                  }
              }
          },
          {
              $group: {
                  _id: {
                      year: { $year: "$createdAt" },
                      month: { $month: "$createdAt" }
                  },
                  totalVendors: { $sum: 1 }
              }
          },
          {
              $project: {
                  _id: 0,
                  month: {
                      $dateToString: {
                          format: "%Y-%m",
                          date: {
                              $dateFromParts: {
                                  year: "$_id.year",
                                  month: "$_id.month"
                              }
                          }
                      }
                  },
                  totalVendors: 1
              }
          },
          {
              $sort: { month: 1 }
          }
      ]);

      return vendorMetrics;
  }
}

