import { createPaginationOptions, formatPhoneNumberforDB, HandleException } from "../../../utils";
import { ErrandStatus, HTTP_STATUS_CODES } from "../../../constants";
import { ICreateErrandData, IErrandDocument } from "../errand.interface";
import { Errand } from "../models/errand.models";
import { PaginatedQueryResult } from "../../../types";

export class ErrandRepository {
  create = async (
    createErrandData: ICreateErrandData,
  ): Promise<IErrandDocument> => {
    const data = {
      ...createErrandData,
      pickupCoordinates: {
        coordinates: createErrandData.pickupCoordinates,
      },
      dropoffCoordinates: {
        coordinates: createErrandData.dropoffCoordinates,
      },
      receiver: {
        name: createErrandData.receiver.name,
        phoneNumber: formatPhoneNumberforDB(
          createErrandData.receiver.phoneNumber,
        ),
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
        HTTP_STATUS_CODES.CONFLICT,
        "A rider is already asssigned to this errand",
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
      { new: true },
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
      { new: true },
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
    page = 1,
  }: {
    userType: "customer" | "rider";
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedQueryResult> => {
    const query = {
      [userType === "rider" ? "rider" : "customer"]: userId,
    };

    const options = createPaginationOptions(
      page,
      {
        select: "-updatedAt -dropoffCoordinates -scheduledPickupTime -pickupCoordinates",
        populate: [
          { path: "customer", select: "fullName phoneNumber" },
          { path: "rider", select: "fullName phoneNumber" },
        ],
      }

    );
    const errands = (await Errand.paginate(
      query,
      options,
    )) as PaginatedQueryResult;

    return errands;
  };
}
