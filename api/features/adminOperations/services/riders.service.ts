import { PaginateResult } from "mongoose";
import { IRiderDocument, Rider } from "../../riders";


export const adminOpsRidersService = {
  async getRiders(page = 1): Promise<PaginateResult<IRiderDocument>> {

    const options = {
      page: page,
      limit: 26,
      select: "_id fullName phoneNumber photo",
      lean: true,
      leanWithId: false,
    }

    const riders = await Rider.paginate({}, options);
    return riders;
  }
}

