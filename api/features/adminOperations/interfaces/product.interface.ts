import { SORT_ORDER } from "../../../constants";
import { IProductCategoryDocument, IProductSubCategoryDocument } from "../../products/products.interface";

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
    status?: string;
    maxPrice?: string;
    minPrice?: string;
    sort?: SORT_ORDER;
  }

export interface GetCategoriesQuery {
    searchQuery?: string;
    page: number;
    limit: number;
  }

export interface CategorySubCategoriesResponse {
    data: IProductSubCategoryDocument['name' | 'id'][];
    totalSubCategories: number;
    category: IProductCategoryDocument['name' | 'id'];
}