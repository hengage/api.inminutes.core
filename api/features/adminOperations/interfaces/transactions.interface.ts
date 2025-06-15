import { SORT_ORDER } from "../../../constants";

export interface GetTransactionsQueryParams {
  status?: string;
  reason?: string;
  type?: string;
  lowestAmount?: string;
  highestAmount?: string;
  fromDate?: string;
  toDate?: string;
  searchQuery?: string;
  page?: number | string;
  limit?: number | string;
  sortOrder?: SORT_ORDER;
}
