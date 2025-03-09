import { ACCOUNT_STATUS } from "../../../constants";

export interface GetVendorsFilter extends VendorMetricsRange {
    accountStatus?: ACCOUNT_STATUS;
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
}

export interface VendorMetricsResponse {
  month: string; 
  totalCustomers: number 
}

  