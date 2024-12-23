
import { PaginateResult } from "mongoose"
import { Order, IOrdersDocument } from "../../orders"
import { FilterQuery } from "mongoose";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions } from "../../../utils";

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
    }
}

export interface GetOrdersFilter {
    searchQuery: string;
    fromDate?: string;
    toDate?: string;
    sort: 'asc' | 'desc';
}
