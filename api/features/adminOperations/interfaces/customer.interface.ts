import { ACCOUNT_STATUS, SORT_ORDER } from "../../../constants";
import { ICustomerDocument } from "../../customers";

export interface GetCustomersQueryParams {
  searchQuery?: string;
  fromDateJoined?: string;
  toDateJoined?: string;
  accountStatus?: ACCOUNT_STATUS;
  page?: number | string;
  limit?: number | string;
  sortOrder?: SORT_ORDER;
}

export interface CustomerSummaryResponse {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface CustomerMetricsRange {
  startDate: string;
  endDate: string;
}

export interface CustomerMetricsResponse {
  month: string;
  totalCustomers: number;
}

export interface ICustomerDetailsWithStats
  extends Omit<ICustomerDocument, keyof Document> {
  totalOrders: number;
  totalErrands: number;
}
