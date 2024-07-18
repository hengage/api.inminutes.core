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

  getErrand = async (errandId: string) => {
    const errand = await Errand.findById(errandId)
      .select("-__v -_updatedAt")
      .populate({ path: "customer", select: "fullName phoneNumber" })
      .populate({ path: "rider", select: "fullName phoneNumber" })
      .lean()
      .exec();

    return errand;
  };
}
