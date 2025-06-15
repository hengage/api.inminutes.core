import { ORDER_TYPE, SORT_ORDER } from "../../../constants";

export interface GetOrdersQueryParams {
  page?: number | string;
  limit?: number | string;
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
  customer?: string;
  status?: string;
  rider?: string;
  vendor?: string;
  type?: ORDER_TYPE;
  sort?: SORT_ORDER;
  onlyOngoing?: boolean; // Optional filter for ongoing orders
}
