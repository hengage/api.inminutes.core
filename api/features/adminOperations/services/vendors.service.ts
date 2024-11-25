import { PaginateResult, FilterQuery } from "mongoose";
import { IVendorDocument, Vendor } from "../../vendors";
import { ACCOUNT_STATUS, HandleException, HTTP_STATUS_CODES, Msg } from "../../../utils";

export class AdminOpsVendorsService {
    private vendorModel = Vendor;

    async getAllVendors(page = 1, filter?: GetVendorsFilter): Promise<PaginateResult<IVendorDocument>> {
        const options = {
            page: page,
            limit: 26,
            select: "_id businessName businessLogo",
            lean: true,
            leanWithId: false,
        };

        const filterQuery: FilterQuery<IVendorDocument> = {};
        if (filter) {
            const validFilters = ['accountStatus', 'category', 'subCategory'];
            Object.entries(filter).forEach(([key, value]) => {
                console.log({ key })
                if (validFilters.includes(key) && value) filterQuery[key] = value;
            });
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
                "Vendor not found"
            );
        }

        return vendor;
    }

    /**
         * Updates vendor account status
         * @param vendorId - The vendor's ID
         * @param status - New account status
         */
    async setAccountStatus(vendorId: IVendorDocument['_id'], status: ACCOUNT_STATUS):
        Promise<void> {
        const vendor = await this.vendorModel.findById(vendorId)
            .select("_id businessName accountStatus")
        if (!vendor) {
            throw new HandleException(
                HTTP_STATUS_CODES.NOT_FOUND,
                Msg.ERROR_VENDOR_NOT_FOUND(vendorId)
            );
        }
        vendor.accountStatus = status;
        await vendor.save();
    }
}

interface GetVendorsFilter {
    accountStatus?: ACCOUNT_STATUS;
    category?: string;
    subCategory?: string;
}