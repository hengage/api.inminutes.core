import { ACCOUNT_STATUS } from "../../../constants";

export interface GetRidersFilter extends GetRiderRangeFilter {
  searchQuery?: string;
  vehicleType?: string;
  currentlyWorking?: string;
  accountStatus: ACCOUNT_STATUS;
}

export interface GetRiderRangeFilter {
  startDate?: String;
  endDate?: String;
}

export interface RiderSummaryResponse {
  totalRiders: number;
  newRiders: number;
  returningRiders: any;
}
