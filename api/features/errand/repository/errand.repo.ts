import { HandleException, STATUS_CODES } from "../../../utils";
import { ErrandStatus } from "../../../config/constants.config";
import { ICreateErrandData, IErrandDocument } from "../errand.interface";
import { Errand } from "../models/errand.models";
import { PaginatedQueryResult, PaginateQueryOptions } from "../../../types";

export class ErrandRepository {
  create = async (
    createErranddata: ICreateErrandData
  ): Promise<IErrandDocument> => {
    const data = {
      ...createErranddata,
      pickupCoordinates: {
        coordinates: createErranddata.pickupCoordinates,
      },
      dropoffCoordinates: {
        coordinates: createErranddata.dropoffCoordinates,
      },
    };

    const errand = new Errand(data);
    return await errand.save();
  };

  getErrand = async (errandId: string): Promise<IErrandDocument | null> => {
    const errand = await Errand.findById(errandId)
      .select("-__v -_updatedAt")
      .populate({ path: "customer", select: "fullName phoneNumber" })
      .populate({ path: "rider", select: "fullName phoneNumber" })
      .lean()
      .exec();

    return errand;
  };

  checkRiderIsAlreadyAssigned = async (errandId: string) => {
    const errand = await Errand.findById(errandId)
      .select("rider")
      .lean()
      .exec();

    if (errand?.rider) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "A rider is already asssigned to this errand"
      );
    }
    return;
  };

  assignRider = async (data: {
    errandId: string;
    riderId: string;
  }): Promise<IErrandDocument | null> => {
    const { errandId, riderId } = data;
    const errand = await Errand.findByIdAndUpdate(
      errandId,
      { $set: { rider: riderId, status: ErrandStatus.RIDER_ASSIGNED } },
      { new: true }
    )
      .select("status rider")
      .exec();

    return errand;
  };

  updateStatus = async (data: {
    errandId: string;
    status: string;
  }): Promise<IErrandDocument | null> => {
    const { errandId, status } = data;
    const errand = await Errand.findByIdAndUpdate(
      errandId,
      { $set: { status } },
      { new: true }
    )
      .select("-__v -updatedAt")
      .exec();

    return errand;
  };

  /**
   * Retrieves a paginated list of errand history based on the provided parameters.
   *
   * @param params - An object containing the following properties:
   *   - customerId: (optional) The ID of the customer to filter errands by.
   *   - riderId: (optional) The ID of the rider to filter errands by.
   *   - page: The page number to retrieve.
   */
  getHistoryForUser = async ({
    userType,
    userId,
    limit,
    page,
  }: {
    userType: "customer" | "rider";
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedQueryResult<IErrandDocument>> => {
    const query = {
      [userType === "rider" ? "rider" : "customer"]: userId,
    };

    console.log({ limit, page });

    const options: PaginateQueryOptions = {
      page: page || 1,
      limit: limit || 20,
      select:
        "-__v -updatedAt -dropoffCoordinates -scheduledPickupTime -pickupCoordinates",
      populate: [
        { path: "customer", select: "fullName phoneNumber" },
        { path: "rider", select: "fullName phoneNumber" },
      ],
      sort: { createdAt: -1 },
      lean: true,
      leanWithId: false,
    };
    const errands = (await Errand.paginate(
      query,
      options
    )) as PaginatedQueryResult<IErrandDocument>;

    return errands;
  };
}
