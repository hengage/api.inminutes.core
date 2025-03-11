import { PaginateResult } from "mongoose";
import { IRiderDocument, Rider } from "../../riders";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions } from "../../../utils/db.utils";
import { FilterQuery } from "mongoose";
import {
  ACCOUNT_STATUS,
  DB_SCHEMA,
  HTTP_STATUS_CODES,
  ORDER_STATUS,
  USER_APPROVAL_STATUS,
  USER_TYPE,
} from "../../../constants";
import { formatPhoneNumberforDB, HandleException, Msg } from "../../../utils";
import { ClientSession } from "mongoose";
import { Wallet } from "../../wallet";
import { IWalletDocument } from "../../wallet/wallet.interface";
import { GetRiderRangeFilter, GetRidersFilter, RiderSummaryResponse } from "../interfaces/rider.interface";
import { Order } from "../../orders";

export const adminOpsRidersService = {
  async getRiders(
    page = 1,
    filter: GetRidersFilter,
  ): Promise<PaginateResult<IRiderDocument>> {

    const options = createPaginationOptions(page, { select: "_id fullName phoneNumber photo" });

    const filterQuery: FilterQuery<IRiderDocument> = {};
    if (filter) {
      addDateRangeFilter(filterQuery, filter.startDate as string, filter.endDate as string);
      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(filter).filter(([_, v]) => v !== undefined),
      );

      const searchFields = ["fullName", "phoneNumber", "email"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
    }

    const riders = await Rider.paginate(filterQuery, options);
    return riders;
  },

  async riderDetails(riderId: string): Promise<IRiderDocument | null> {
    const rider = await Rider.findById(riderId)
      .select("-__v -updatedAt -location.type -password")
      .lean();

    if (!rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_RIDER_NOT_FOUND(riderId),
      );
    }
    return rider;
  },

  /**
   * Updates rider account status
   * @param rider - The rider's ID
   * @param status - New account status
   */
  async setAccountStatus(
    riderId: IRiderDocument["_id"],
    status: ACCOUNT_STATUS,
  ): Promise<void> {
    const rider = await Rider.findById(riderId).select("_id accountStatus");

    if (!rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_RIDER_NOT_FOUND(riderId),
      );
    }
    rider.accountStatus = status;
    await rider.save();
  },

  async setApprovalStatus(
    riderId: IRiderDocument["_id"],
    approved: USER_APPROVAL_STATUS,
  ): Promise<void> {
    const rider = await Rider.findById(riderId).select("_id approved");

    if (!rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_RIDER_NOT_FOUND(riderId),
      );
    }
    rider.approvalStatus = approved;
    await rider.save();
  },

  
  async updateRider(
    riderId: string,
    updateData: Partial<any>,
    session?: ClientSession
  ): Promise<IRiderDocument> {

    const updateObject: Partial<any> = { ...updateData };
  
    if (updateData.phoneNumber) {
      updateObject.phoneNumber = formatPhoneNumberforDB(updateData.phoneNumber);
    }
  

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      updateObject,
      { new: true, session }
    ).select("-password -__v");
  
    if (!rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_RIDER_NOT_FOUND(riderId)
      );
    }
  
    return rider;
  },

  async getRiderWallet(riderId: string): Promise<IWalletDocument>{
    const wallet = await Wallet.findOne({merchantId: riderId, merchantType: USER_TYPE.RIDER});
    if(!wallet) {
      throw new HandleException(HTTP_STATUS_CODES.NOT_FOUND, Msg.ERROR_RIDER_WALLET_NOT_FOUND(riderId));
    }
    return wallet;
  },

  
    async getTopList(
        page = 1,
        filter: GetRidersFilter,
        limit = 5
    ): Promise<PaginateResult<IRiderDocument>> {
      const options = createPaginationOptions(page, { select: "_id fullName displayName email" }, limit);
  
      const filterQuery: FilterQuery<IRiderDocument> = {};
      if (filter) {
        addDateRangeFilter(filterQuery, filter.startDate as string, filter.endDate as string);
        const recordFilter: Record<string, string> = Object.fromEntries(
          Object.entries(filter).filter(([_, v]) => v !== undefined),
        );
  
        const searchFields = ["fullName", "displayName", "email", "phoneNumber"];
        buildFilterQuery(recordFilter, filterQuery, searchFields);
        }
  
        const topRiders = await Order.aggregate([
            {
                $match: { status: ORDER_STATUS.DELIVERED }
            },
            {
                $group: {
                    _id: "$rider",
                    totalDeliveries: { $sum: 1 }
                }
            },
            { $sort: { totalDeliveries: -1 } },
            {
                $lookup: {
                    from: DB_SCHEMA.RIDER,
                    localField: "_id",
                    foreignField: "_id",
                    as: "riderDetails"
                }
            },
            { $unwind: "riderDetails" },
            {
                $project: {
                    _id: "$riderDetails._id",
                    fullName: "$riderDetails.fullName",
                    displayName: "$riderDetails.displayName",
                    email: "$riderDetails.email",
                    phoneNumber: "$riderDetails.phoneNumber",
                    totalDeliveries: 1
                }
            }
        ]);
  
        const riderIds = topRiders.map((rider: any) => rider._id);
        const totalDeliveriesMap = new Map(topRiders.map(c => [c._id.toString(), c.totalDeliveries]));
  
        const paginatedRiders: PaginateResult<IRiderDocument> = await Rider.paginate(
            { _id: { $in: riderIds }, ...filterQuery },
            options
        );
  
        paginatedRiders.docs = paginatedRiders.docs.map((rider: any) => {
          const riderObj = rider.toObject();
          return {
              ...riderObj,
              totalDeliveries: totalDeliveriesMap.get(rider._id.toString()) || 0
          };
      });
        return paginatedRiders;
    },
  
    async getRiderSummary(): Promise<RiderSummaryResponse> {
        const totalRiders = await Rider.countDocuments({});
  
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
        const newRiders = await Rider.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
  
        const returningRiders = await Rider.aggregate([
            {
                $group: {
                    _id: "$rider",
                    orderCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    orderCount: { $gt: 1 }
                }
            },
            {
                $count: "returningRiders"
            }
        ]);
  
        return {
            totalRiders,
            newRiders,
            returningRiders: returningRiders[0]?.returningRiders || 0
        };
    },
  
    async getRiderMetrics(data: GetRiderRangeFilter): Promise<any[]> {
        const riderMetrics = await Rider.aggregate([
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
                    totalRiders: { $sum: 1 }
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
                    totalRiders: 1
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);
  
        return riderMetrics;
    },
  
    async deleteRider(riderId: string, session?: ClientSession): Promise<Boolean> {
      const rider = await Rider.findByIdAndUpdate(
        riderId,
        { isDeleted: true },
        { new: true, session }
      );
    
      if (!rider) {
        throw new HandleException(
          HTTP_STATUS_CODES.NOT_FOUND,
          Msg.ERROR_RIDER_NOT_FOUND(riderId)
        );
      }
    
      return true;
    }
  
};


