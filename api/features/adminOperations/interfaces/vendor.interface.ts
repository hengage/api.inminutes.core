import { ACCOUNT_STATUS, USER_APPROVAL_STATUS } from "../../../constants";

export interface GetVendorsFilter extends VendorMetricsRange {
    accountStatus?: ACCOUNT_STATUS;
    approvalStatus?: USER_APPROVAL_STATUS,
    category?: string;
    subCategory?: string;
    searchQuery: string;
}
  
export interface ProductMetrics {
    pendingProducts: number;
    approvedProducts: number;
    rejectedProducts: number;
    totalProducts: number;
}

export interface VendorSummaryResponse {
  totalVendors: number;
  newVendors: number;
  returningVendors: number;
}

export interface VendorMetricsRange {
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: string;
  page?: string;
}

export interface VendorMetricResponse {
  month: string; 
  totalCustomers: number
}

export interface Responses {
  page: number,
  pages:number,
  total: number,
  limit: number
} 
export interface VendorMetricsResponse extends Responses {
  data: VendorMetricResponse[]
}

export interface ITopVendors extends Responses {
  data: any[]
} 