import { Document } from "mongoose";

/**
 * Represents the result of a paginated query, including the requested page of documents, as well as metadata about the pagination.
 *
 * @template T - The type of document returned in the `docs` array.
 * @property {T[]} docs - The array of documents for the requested page.
 * @property {number} totalDocs - The total number of documents matching the query.
 * @property {number} limit - The number of documents returned per page.
 * @property {number} totalPages - The total number of pages available.
 * @property {number} page - The current page number.
 * @property {number} pagingCounter - The index of the first document on the current page.
 * @property {boolean} hasPrevPage - Indicates whether there is a previous page available.
 * @property {boolean} hasNextPage - Indicates whether there is a next page available.
 * @property {number | null} prevPage - The page number of the previous page, or `null` if there is no previous page.
 * @property {number | null} nextPage - The page number of the next page, or `null` if there is no next page.
 */
// type PaginatedQueryResult<T extends Document> = {
//   docs: T[];
//   totalDocs: number;
//   limit: number;
//   totalPages: number;
//   page: number;
//   pagingCounter: number;
//   hasPrevPage: boolean;
//   hasNextPage: boolean;
//   prevPage: number | null;
//   nextPage: number | null;
// };

type PaginatedQueryResult<T extends Document> = Record<[key: string], any>;

type PaginateQueryOptions = {
  page: number;
  limit: number;
  select: string;
  populate?: Array<{ path: string; select: string }>;
  sort: { [key: string]: 1 | -1 };
  lean?: boolean;
  leanWithId?: boolean;
};
import jwt, { JwtPayload } from "jsonwebtoken";

type CustomJwtPayload = JwtPayload & {
  _id: string;
  phoneNumber: string;
};

type Coordinates = [number, number];

type DynamicObject = Record<string, { [key: string]: any }>;
