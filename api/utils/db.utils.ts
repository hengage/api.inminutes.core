/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from "luxon";
import { FilterQuery } from "mongoose";
import { QUERY_LIMIT } from "../constants";
import { PaginateQueryOptions } from "../types";

/**
 * Builds a MongoDB filter query based on the provided filter object.
 *
 * @param filter - An object containing the filter criteria.
 * @param filterQuery - An optional initial filter query object.
 * @param searchFields - An optional array of field names to search within.
 * @returns The updated filter query object.
 */
export function buildFilterQuery<T>(
  filter: Record<string, string>,
  filterQuery: FilterQuery<T> = {},
  searchFields?: string[],
): FilterQuery<T> {
  // Handle non-search filters
  Object.entries(filter).forEach(([key, value]) => {
    if (value && key !== "searchQuery") {
      (filterQuery as any)[key] = value;
    }
  });

  // Handle search
  if (
    filter.searchQuery &&
    filter.searchQuery.length >= 2 &&
    filter.searchQuery.length <= 20
  ) {
    const sanitizedSearch = filter.searchQuery.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const searchRegex = new RegExp(sanitizedSearch, "i");
    (filterQuery as any).$or = searchFields!.map((field) => ({
      [field]: searchRegex,
    }));
  }

  return filterQuery;
}


/**
 * Adds amount range filters to a MongoDB filter query
 * @param filterQuery - The filter query to modify
 * @param lowestAmount - Optional minimum amount
 * @param highestAmount - Optional maximum amount
 */
export function addAmountRangeFilter<T>(
  filterQuery: FilterQuery<T>,
  lowestAmount?: string,
  highestAmount?: string
): void {
  if (lowestAmount || highestAmount) {
    (filterQuery as any).$expr = {
      $and: []
    };
    if (lowestAmount) {
      (filterQuery as any).$expr.$and.push({
        $gte: [{ $convert: { input: "$amount", to: "double" } }, parseFloat(lowestAmount)]
      });
    }
    if (highestAmount) {
      (filterQuery as any).$expr.$and.push({
        $lte: [{ $convert: { input: "$amount", to: "double" } }, parseFloat(highestAmount)]
      });
    }
  }
}

/**
 * Adds date range filters to a MongoDB filter query
 * @param filterQuery - The filter query to modify
 * @param fromDate - Optional start date in ISO format
 * @param toDate - Optional end date in ISO format
 * @param dateField - The field name to filter on (defaults to 'createdAt')
 */
export function addDateRangeFilter<T>(
  filterQuery: FilterQuery<T>,
  fromDate?: string,
  toDate?: string,
  dateField: string = 'createdAt'
): void {
  if (fromDate || toDate) {
    (filterQuery as any)[dateField] = {};
    if (fromDate) {
      (filterQuery as any)[dateField].$gte = DateTime.fromISO(fromDate).startOf('day').toJSDate();
    }
    if (toDate) {
      (filterQuery as any)[dateField].$lte = DateTime.fromISO(toDate).endOf('day').toJSDate();
    }
  }
}

export function createPaginationOptions(
  page: number,
  customOptions: Record<string, any> = {}
): Record<string, any> {
  const defaultOptions: PaginateQueryOptions = {
    page,
    limit: QUERY_LIMIT,
    select: "",
    lean: true,
    leanWithId: false,
    sort: { createdAt: -1 },
  };
  return { ...defaultOptions, ...customOptions };
}