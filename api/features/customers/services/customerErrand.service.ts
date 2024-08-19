import { errandService } from "../../errand";

export class CustomerErrandService {
  private errand: typeof errandService;
  constructor() {
    this.errand = errandService;
  }

  getHistory = async ({
    userType,
    customerId,
    page = 1,
    limit = 20,
  }: {
    userType: "customer" | "rider";
    customerId: string;
    page?: number;
    limit?: number;
  }) => {
    return this.errand.getHistoryForUser({
      userType,
      userId: customerId,
      page,
      limit,
    });
  };
}
