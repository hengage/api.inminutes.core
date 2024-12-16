import { FilterQuery } from "mongoose";

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
