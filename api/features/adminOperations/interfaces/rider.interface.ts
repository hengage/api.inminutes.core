import { ACCOUNT_STATUS, SORT_ORDER } from "../../../constants";

export interface GetRidersQueryparams extends GetRiderRangeFilter {
  vehicleType?: string;
  currentlyWorking?: boolean;
  accountStatus?: ACCOUNT_STATUS;
  searchQuery?: string;
  sortOrder?: SORT_ORDER;
  page?: number | string;
  limit?: number | string;
}

export interface GetRiderRangeFilter {
  fromDate?: string;
  toDate?: string;
}

export interface RiderSummaryResponse {
  totalRiders: number;
  newRiders: number;
  returningRiders: any;
}

export interface FindNearbyRidersParams {
  lng: string;
  lat: string;
  distanceInKM: string;
}
