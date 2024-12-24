import { FilterQuery, PaginateResult } from "mongoose";
import { ORDER_TYPE, SORT_ORDER } from "../../../constants";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions } from "../../../utils";
import { Errand } from "../../errand/models/errand.models";
import { IErrandDocument } from "../../errand";

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
    }
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