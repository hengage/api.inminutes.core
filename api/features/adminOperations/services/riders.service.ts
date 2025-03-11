import { PaginateResult } from "mongoose";
import { IRiderDocument, Rider } from "../../riders";
import { buildFilterQuery, createPaginationOptions } from "../../../utils/db.utils";
import { FilterQuery } from "mongoose";
import {
  ACCOUNT_STATUS,
  HTTP_STATUS_CODES,
  USER_APPROVAL_STATUS,
  USER_TYPE,
} from "../../../constants";
import { formatPhoneNumberforDB, HandleException, Msg } from "../../../utils";
import { ClientSession } from "mongoose";
import { Wallet } from "../../wallet";
import { IWalletDocument } from "../../wallet/wallet.interface";

export const adminOpsRidersService = {
  async getRiders(
    page = 1,
    filter: GetRidersFilter,
  ): Promise<PaginateResult<IRiderDocument>> {

    const options = createPaginationOptions(page, { select: "_id fullName phoneNumber photo" });

    const filterQuery: FilterQuery<IRiderDocument> = {};
    if (filter) {
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
        Msg.ERROR_VENDOR_NOT_FOUND(riderId)
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
  } ,
  
};

interface GetRidersFilter {
  searchQuery?: string;
  vehicleType?: string;
  currentlyWorking?: string;
  accountStatus: ACCOUNT_STATUS;
}
