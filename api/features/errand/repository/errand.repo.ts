import { HandleException, STATUS_CODES } from "../../../utils";
import { ICreateErrandData, IErrandDocument } from "../errand.interface";
import { Errand } from "../models/errand.models";

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

  getErrand = async (errandId: string):Promise<IErrandDocument | null> => {
    const errand = await Errand.findById(errandId)
      .select("-__v -_updatedAt")
      .populate({ path: "customer", select: "fullName phoneNumber" })
      .populate({ path: "rider", select: "fullName phoneNumber" })
      .lean()
      .exec();

    return errand;
  };

  assignRider = async (data: {
    errandId: string;
    riderId: string;
    status: string;
  }): Promise<IErrandDocument | null> => {
    const { errandId, riderId, status } = data;
    const errand = await Errand.findByIdAndUpdate(
      errandId,
      { $set: { rider: riderId, status } },
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
}
