import { PaginateResult, FilterQuery } from "mongoose";
import { IVendorDocument, Vendor } from "../../vendors";
import { ACCOUNT_STATUS, DB_SCHEMA, HTTP_STATUS_CODES, ORDER_STATUS, USER_APPROVAL_STATUS } from "../../../constants";
import { formatPhoneNumberforDB, HandleException, Msg } from "../../../utils";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions, IMetricsQueryOptions, metricsQuery } from "../../../utils/db.utils";
import { Product } from "../../products";
import { Order } from "../../orders";
import { IVendorSignupData } from "../../vendors/vendors.interface";
import { ClientSession } from "mongoose";
import { DateTime } from "luxon";
import { GetVendorsFilter, ITopVendors, ProductMetrics, VendorMetricsResponse, VendorSummaryResponse } from "../interfaces/vendor.interface";

export class AdminOpsVendorsService {
  private vendorModel = Vendor;
  private productModel = Product;
  private orderModel = Order;

  async getAllVendors(
    page = 1,
    filter: GetVendorsFilter,
  ): Promise<PaginateResult<IVendorDocument>> {
    const options = createPaginationOptions(page, { select: "_id businessName businessLogo accountStatus email createdAt" });
    const filterQuery: FilterQuery<IVendorDocument> = {};
    if (filter) {
      addDateRangeFilter(filterQuery, filter.startDate as string, filter.endDate as string);
      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(filter).filter(([_, v]) => v !== undefined),
      );

      const searchFields = ["businessName", "email", "phoneNumber"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
      delete filterQuery.startDate;
      delete filterQuery.endDate;
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
      .select("_id approvalStatus");
    if (!vendor) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_VENDOR_NOT_FOUND(vendorId),
      );
    }
    approved ?
    vendor.approvalStatus = USER_APPROVAL_STATUS.APPROVED : vendor.approvalStatus = USER_APPROVAL_STATUS.REJECTED;
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
      limit = 5
  ): Promise<ITopVendors> {

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const skip = (pageNum - 1) * limitNum;
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
                  from: "vendors",
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
          },
          { $skip: skip },
          { $limit: limitNum }
      ]);

      const totalCount = await this.orderModel.aggregate([
        {
            $match: { status: ORDER_STATUS.DELIVERED }
        },
        {
            $group: {
                _id: "$vendor"
            }
        },
        { $count: "total" }
    ]);

    return {
        data: topVendors,
        page: pageNum,
        pages: Math.ceil((totalCount[0]?.total || 0) / limit),
        total: totalCount[0]?.total || 0,
        limit: limitNum
    };
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

  async getVendorMetrics(data: IMetricsQueryOptions): Promise<VendorMetricsResponse> {
      const { $gte, $lte, $skip, $limit, page } = metricsQuery(data)
      const vendorMetrics = await Vendor.aggregate([
          {
              $match: {
                  createdAt: {
                      $gte,
                      $lte
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
          },
          { $skip },
          { $limit }
      ]);

      const totalCountResult = await Vendor.aggregate([
        {
            $match: {
                createdAt: {
                    $gte,
                    $lte
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                }
            }
        },
        { $count: "total" }
    ]);

    const total = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
    const pages = Math.ceil(total / Number($limit));
      return {
        data: vendorMetrics,
        page,
        limit: $limit,
        total,
        pages,
      }
  }

  async updateVendor(
    vendorId: string,
    updateData: Partial<IVendorSignupData>,
    session?: ClientSession
  ): Promise<IVendorDocument> {

    const updateObject: Partial<IVendorSignupData> = { ...updateData };
  
    if (updateData.phoneNumber) {
      updateObject.phoneNumber = formatPhoneNumberforDB(updateData.phoneNumber);
    }
  
    // Update the vendor
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updateObject,
      { new: true, session }
    ).select("-password -__v");
  
    if (!vendor) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_VENDOR_NOT_FOUND(vendorId)
      );
    }
  
    return vendor;
  }

  async deleteVendor(vendorId: string, session?: ClientSession): Promise<Boolean> {
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isDeleted: true },
      { new: true, session }
    );
  
    if (!vendor) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_VENDOR_NOT_FOUND(vendorId)
      );
    }
  
    return true;
  }
}


