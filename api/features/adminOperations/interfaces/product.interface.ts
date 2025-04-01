import { SORT_ORDER } from "../../../constants";

export interface ProductSummaryResponse {
    totalProducts: number;
    newProducts: number;
    returningProducts: any;
}

export interface GetProductRangeFilter {
    startDate?: string;
    endDate?: string;
}

export interface GetProductsFilter {
    searchQuery?: string;
    fromDate?: string;
    toDate?: string;
    category?: string;
    vendor?: string;
    sort?: SORT_ORDER;
  }