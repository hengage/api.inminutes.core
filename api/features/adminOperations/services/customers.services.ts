import { PaginateResult } from "mongoose"
import { Customer, ICustomerDocument } from "../../customers"
import { FilterQuery } from "mongoose";
import { addDateRangeFilter, buildFilterQuery } from "../../../utils";

export const AdminOpsForCustomersService = {
    async getList(page = 1, filter: GetCustomersFilter): Promise<PaginateResult<ICustomerDocument>> {
        const options = {
            page,
            limit: 30,
            select: "_id fullName email phoneNumber",
            lean: true,
            leanWithId: false
        }

        const filterQuery: FilterQuery<ICustomerDocument> = {};
        if (filter) {
            const { fromDateJoined: fromDate, toDateJoined: toDate, ...otherFilters }
                = filter;

            // Handle date range 
            addDateRangeFilter(filterQuery, fromDate, toDate);

            // Handle other filters
            const recordFilter: Record<string, string> = Object.fromEntries(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Object.entries(otherFilters).filter(([_, v]) => v !== undefined),
            );

            const searchFields = [" fullname", "email", "phoneNumber"];
            buildFilterQuery(recordFilter, filterQuery, searchFields);
        }

        const transactions = await Customer.paginate(filterQuery, options);
        return transactions;

    }
}

export interface GetCustomersFilter {
    searchQuery: string;
    fromDateJoined?: string;
    toDateJoined?: string;
}