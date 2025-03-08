export interface GetCustomersFilter {
    searchQuery: string;
    fromDateJoined?: string;
    toDateJoined?: string;
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
    totalCustomers: number 
}