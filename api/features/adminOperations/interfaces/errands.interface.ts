import { ORDER_TYPE, SORT_ORDER } from "../../../constants";

export interface GetErrandsQueryParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  customer?: string;
  rider?: string;
  searchQuery?: string;
  type?: ORDER_TYPE;
  sort?: SORT_ORDER;
  page?: number | string;
  limit?: number | string;
}
