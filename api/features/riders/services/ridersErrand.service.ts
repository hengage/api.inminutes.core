import { USER_TYPE } from "../../../constants";
import { errandService } from "../../errand";

export class RiderErrandService {
  private errand: typeof errandService;
  constructor() {
    this.errand = errandService;
  }

  getHistory = async ({
    userType,
    riderId,
    page,
    limit,
  }: {
    userType: USER_TYPE.RIDER;
    riderId: string;
    page?: number;
    limit?: number;
  }) => {
    return this.errand.getHistoryForUser({
      userType,
      userId: riderId,
      page,
      limit,
    });
  };
}
