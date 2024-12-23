
import { PaginateResult } from "mongoose"
import { Order, IOrdersDocument } from "../../orders"
import { FilterQuery } from "mongoose";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions, HandleException, Msg } from "../../../utils";
import { DB_SCHEMA, HTTP_STATUS_CODES } from "../../../constants";

export const AdminOpsForOrdersService = {
    async getList(page = 1, filter: GetOrdersFilter): Promise<PaginateResult<IOrdersDocument>> {
        const options = createPaginationOptions(
            page,
            {
                select: "_id  totalCost status createdAt",
                sort: { createdAt: filter.sort === 'asc' ? 1 : -1 }
            }
        );

        const filterQuery: FilterQuery<IOrdersDocument> = {};
        if (filter) {
            const { fromDate, toDate, ...otherFilters } = filter;

            // Handle date range 
            addDateRangeFilter(filterQuery, fromDate, toDate);

            // Handle other filters
            const recordFilter: Record<string, string> = Object.fromEntries(
                Object.entries(otherFilters)
                    .filter(([key, v]) => v !== undefined && key !== 'sort'),
            );

            const searchFields = ["_id", "status"];
            buildFilterQuery(recordFilter, filterQuery, searchFields);
        }

        const orders = await Order.paginate(filterQuery, options);
        return orders;
    },

    async getDetails(orderId: IOrdersDocument['_id']): Promise<IOrdersDocument> {
        const order = await Order.findById(orderId)
            .select('-__v -deliveryLocation')
            .populate({ path: DB_SCHEMA.RIDER.toLowerCase(), select: "fullName" })
            .populate({ path: DB_SCHEMA.CUSTOMER.toLowerCase(), select: "fullName" })
            .populate({ path: DB_SCHEMA.VENDOR.toLowerCase(), select: "businessName businessLogo" })
            .lean()
            .exec();

        if (!order) {
            throw new HandleException(
                HTTP_STATUS_CODES.NOT_FOUND,
                Msg.ERROR_NOT_FOUND('order', orderId)
            );
        }
        return order;
    }
}

export interface GetOrdersFilter {
    searchQuery: string;
    fromDate?: string;
    toDate?: string;
    sort: 'asc' | 'desc';
}
