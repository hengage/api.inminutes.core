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
    userType: "rider";
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
