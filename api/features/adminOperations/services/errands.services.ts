import { FilterQuery, PaginateResult } from "mongoose";
import { HTTP_STATUS_CODES, ORDER_TYPE, SORT_ORDER } from "../../../constants";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions, HandleException, Msg } from "../../../utils";
import { Errand, ErrandPackageType } from "../../errand/";
import { IErrandDocument } from "../../errand";
import { IErrandPackageTypeDocument } from "../../errand/errand.interface";
import { PaginatedQueryResult } from "../../../types";

export const AdminOpsForErrandsService = {
    async getList(page = 1, filter: GetErrandsFilter): Promise<PaginateResult<IErrandDocument>> {
        const options = createPaginationOptions(
            page,
            {
                select: "_id  pickupAddress type status createdAt",
                sort: { createdAt: filter.sort === SORT_ORDER.ASC ? 1 : -1 }
            }
        );

        const filterQuery: FilterQuery<IErrandDocument> = {};
        if (filter) {
            const { fromDate, toDate, ...otherFilters } = filter;

            addDateRangeFilter(filterQuery, fromDate, toDate);

            const recordFilter: Record<string, string> = Object.fromEntries(
                Object.entries(otherFilters)
                    .filter(([key, v]) => v !== undefined && key !== 'sort' && key !== 'page'),
            );

            const searchFields = ["_id"];
            buildFilterQuery(recordFilter, filterQuery, searchFields);
        }

        const errands = await Errand.paginate(filterQuery, options);
        return errands;
    },

    async getErrands({
        userId,
        page,
        limit,
        status,
        search,
        startDate,
        endDate
    }: {
        userId?: string;
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        startDate?: string
        endDate?: string,

    }): Promise<PaginatedQueryResult> {

        let query: any = {};

        if(userId){
            query = {
                $or: [{ customer: userId }, { rider: userId }],
            };
        }
        const safePage = Number(page) || 1;
        const safeLimit = Number(limit) || 10;

        // Status filter
        if (status) {
            query.status = status;
        }

        // Search filter (example: pickup or dropoff address)
        if (search) {
            query.$or = [
            ...(query.$or || []),
            { pickupAddress: { $regex: search, $options: "i" } },
            { dropoffAddress: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            ];
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
            const options = createPaginationOptions(
            safePage,
            {
                select: "-updatedAt -dropoffCoordinates -scheduledPickupTime -pickupCoordinates",
                populate: [
                { path: "customer", select: "fullName phoneNumber" },
                { path: "rider", select: "fullName phoneNumber" },
                ],
            },
            safeLimit
            );
            
            const errands = (await Errand.paginate(
            query,
            options,
            )) as PaginatedQueryResult;

            return errands;
    },

    async getDetails(errandId: IErrandDocument['_id']): Promise<IErrandDocument> {
        const errand = await Errand.findById(errandId)
            .select('-__v -pickUpCoordinates.type -dropoffCoordinates.type')
            .populate({ path: 'customer', select: "fullName" })
            .populate({ path: 'rider', select: "fullName" })
            .lean()
            .exec();

        if (!errand) {
            throw new HandleException(
                HTTP_STATUS_CODES.NOT_FOUND,
                Msg.ERROR_NOT_FOUND('errand', errandId));
        }

        return errand;
    },

    async addPackageType(addPackageTypeData: Pick<IErrandPackageTypeDocument, 'packageType' | 'image'>): Promise<IErrandPackageTypeDocument> {
        const { packageType } = addPackageTypeData
        const existingPackageType = await ErrandPackageType.findOne({
            packageType: packageType.toLowerCase().trim()
        })
            .select('packageType')
            .lean();
        if (existingPackageType) {
            throw new HandleException(
                HTTP_STATUS_CODES.CONFLICT,
                `${packageType.toLowerCase().trim()}` +
                ` already exists as a package type`
            );
        }

        return await ErrandPackageType.create(addPackageTypeData);
    },

    async updatePackageType(
        packageTypeId: string,
        updateData: Partial<Pick<IErrandPackageTypeDocument, 'packageType' | 'image'>>
    ): Promise<IErrandPackageTypeDocument> {
        const packageType = await ErrandPackageType.findByIdAndUpdate(
            packageTypeId,
            { $set: updateData },
            { new: true }
        )

        if (!packageType) {
            throw new HandleException(
                HTTP_STATUS_CODES.NOT_FOUND,
                Msg.ERROR_NOT_FOUND("package type", packageTypeId)
            );
        }

        return packageType;
    },

    async deletePackageType(packageTypeId: string): Promise<void> {
        const existingPackageType = await ErrandPackageType.findByIdAndDelete(packageTypeId);
        if (!existingPackageType) {
            throw new HandleException(
                HTTP_STATUS_CODES.NOT_FOUND,
                Msg.ERROR_NOT_FOUND("package type", packageTypeId)
            );
        }
    },
}

export interface GetErrandsFilter {
    fromDate?: string;
    toDate?: string;
    customer?: string;
    rider?: string
    searchQuery?: string;
    sort?: SORT_ORDER;
    type?: ORDER_TYPE
}