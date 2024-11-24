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

/**
 * Redundant.
 * Use mongose 'PaginateResult' type instead
 */
type PaginatedQueryResult<T extends Document> = Record<
  [key: string],
  JSONValue
>;
// Todo: make redundant. Use mongoose PaginateResult type

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
import { IRiderDocument } from "./features/riders";
import { ICustomerDocument } from "./features/customers";

type CustomJwtPayload = JwtPayload & {
  _id: string;
  phoneNumber: string;
};

type Coordinates = [lng: number, lat: number];

type DynamicObject = Record<any, JSONObject>;

type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR"
  | "UNPROCESSABLE_ENTITY";

type SuccessCode = "OK" | "CREATED" | "NO_CONTENT";

type JSONValue =
  | (null | undefined)
  | string
  | number
  | boolean
  | JSONObject
  | Array<JSONValue>;

type JSONObject = { [key: string]: JSONValue };

type ApiError = {
  status: "error";
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};
interface ApiSuccessResponse<T = JSONValue | null> {
  status: "success";
  data: T;
  message?: string;
}

type UserId =
  | IVendorDocument["_id"]
  | IRiderDocument["_id"]
  | ICustomerDocument["_id"];