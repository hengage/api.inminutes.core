/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateTime } from "luxon";
import { FilterQuery, Schema } from "mongoose";
import { QUERY_LIMIT } from "../constants";
import { PaginateQueryOptions } from "../types";

/**
 * Builds a MongoDB filter query based on the provided filter object.
 *
 * @param filterFields - An object containing the model fields to filter by.
 * @param filterQuery - An optional initial filter query object.
 * @param searchFields - An optional array of field names to search within.
 * @returns The updated filter query object.
 */
export function buildFilterQuery<T>(
  filterFields: Record<string, string | number | boolean>,
  filterQuery: FilterQuery<T> = {},
  searchFields?: string[]
): FilterQuery<T> {
  // Handle non-search filters
  Object.entries(filterFields).forEach(([key, value]) => {
    if (value && key !== "searchQuery") {
      (filterQuery as any)[key] = value;
    }
  });

  // Handle search
  const { searchQuery } = filterFields as { searchQuery: string };

  if (searchQuery && searchQuery.length >= 2 && searchQuery.length <= 20) {
    const sanitizedSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      $and: [],
    };
    if (lowestAmount) {
      (filterQuery as any).$expr.$and.push({
        $gte: [
          { $convert: { input: "$amount", to: "double" } },
          parseFloat(lowestAmount),
        ],
      });
    }
    if (highestAmount) {
      (filterQuery as any).$expr.$and.push({
        $lte: [
          { $convert: { input: "$amount", to: "double" } },
          parseFloat(highestAmount),
        ],
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
  dateField: string = "createdAt"
): void {
  if (fromDate || toDate) {
    (filterQuery as any)[dateField] = {};
    if (fromDate) {
      (filterQuery as any)[dateField].$gte = DateTime.fromISO(fromDate)
        .startOf("day")
        .toJSDate();
    }
    if (toDate) {
      (filterQuery as any)[dateField].$lte = DateTime.fromISO(toDate)
        .endOf("day")
        .toJSDate();
    }
  }
}

/**
 * Adds price range filters to a MongoDB filter query
 * Assumes the "cost" field is stored as a string, so conversion is required.
 * @param filterQuery - The filter query to modify
 * @param minPrice - Optional minimum price
 * @param maxPrice - Optional maximum price
 * @param costField - The field name to filter on (defaults to 'cost')
 */
export function addPriceRangeFilter<T>(
  filterQuery: FilterQuery<T>,
  minPrice?: string,
  maxPrice?: string,
  costField = "cost"
): void {
  if (minPrice || maxPrice) {
    const priceExprConditions: any[] = [];

    if (minPrice) {
      priceExprConditions.push({
        $gte: [{ $toDouble: `${costField}` }, parseFloat(minPrice)],
      });
    }

    if (maxPrice) {
      priceExprConditions.push({
        $lte: [{ $toDouble: `${costField}` }, parseFloat(maxPrice)],
      });
    }

    // Merge with existing $expr if any
    if ((filterQuery as any).$expr && (filterQuery as any).$expr.$and) {
      (filterQuery as any).$expr.$and.push(...priceExprConditions);
    } else if ((filterQuery as any).$expr) {
      // Convert single $expr to $and if needed
      const existingExpr = (filterQuery as any).$expr;
      (filterQuery as any).$expr = {
        $and: [existingExpr, ...priceExprConditions],
      };
    } else {
      (filterQuery as any).$expr =
        priceExprConditions.length === 1
          ? priceExprConditions[0]
          : { $and: priceExprConditions };
    }
  }
}

export function createPaginationOptions(
  customOptions: Record<string, any> = {},
  page?: number,
  limit?: number
): Record<string, any> {
  const defaultOptions: PaginateQueryOptions = {
    page: page ?? 1,
    limit: limit ?? QUERY_LIMIT,
    select: "",
    lean: true,
    leanWithId: false,
    sort: { createdAt: -1 },
  };
  return { ...defaultOptions, ...customOptions };
}

export function metricsQuery(data: IMetricsQueryOptions) {
  const $gte = DateTime.fromISO(data.startDate as string)
    .startOf("day")
    .toJSDate();
  const $lte = DateTime.fromISO(data.endDate as string)
    .startOf("day")
    .toJSDate();
  const $limit = Number(data.limit) || 10;
  const page = Number(data.page) || 1;
  const $skip = (page - 1) * $limit;

  return {
    $gte,
    $lte,
    $limit,
    $skip,
    page,
  };
}

/**
 * Mongoose plugin that automatically excludes soft-deleted documents from queries.
 *  @example
 * // Apply plugin to a schema
 * const userSchema = new Schema({
 *   name: String,
 *   email: String,
 *   isDeleted: { type: Boolean, default: false }
 * });
 * userSchema.plugin(excludeDeletedPlugin);
 *
 * @note
 * - Ensure` documents have an `isDeleted` field (preferably boolean)
 *
 * @bypass
 * Use `includeDeleted: true` in query options to bypass this filter and include deleted documents.
 *
 * For populate operations, set `includeDeleted: true` in the populate options
 */

export function excludeDeletedPlugin(schema: Schema) {
  // Apply to .find()
  schema.pre(
    ["find", "findOne", "findOneAndUpdate", "countDocuments"],
    function () {
      // Check if includeDeleted option is set
      if (!this.getOptions().includeDeleted) {
        this.where({ isDeleted: false });
      }
    }
  );

  // Apply to .findById()
  schema.pre("findOne", function () {
    const query = this.getQuery();
    if (query._id && !this.getOptions().includeDeleted) {
      this.where({ isDeleted: false });
    }
  });

  // Optional: exclude from .aggregate()
  schema.pre("aggregate", function () {
    if (!this.options.includeDeleted) {
      this.pipeline().unshift({ $match: { isDeleted: false } });
    }
  });
}

export interface IMetricsQueryOptions {
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: string;
  page?: string;
}
