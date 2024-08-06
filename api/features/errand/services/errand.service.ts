import { HandleException, STATUS_CODES } from "../../../utils";
import { ErrandStatus } from "../../../utils/constants.utils";
import { NotificationService } from "../../notifications";
import { ICreateErrandData } from "../errand.interface";
import { ErrandRepository } from "../repository/errand.repo";

class ErrandService {
  private errandRepo: ErrandRepository;
  private notification: NotificationService;

  constructor() {
    this.errandRepo = new ErrandRepository();
    this.notification = new NotificationService();
  }

  create = async (createErranddata: ICreateErrandData) => {
    return await this.errandRepo.create(createErranddata);
  };

  getErrand = async (errandId: string) => {
    const errand = await this.errandRepo.getErrand(errandId);
    if (!errand) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Errand not found");
    }

    return errand;
  };

  assignRider = async (data: {errandId: string; riderId: string;  }) => {
    await this.errandRepo.checkRiderIsAlreadyAssigned(data.errandId)
    return await this.errandRepo.assignRider(data);
  };

  pickedUpPackage = async (errandId: string) => {
    return await this.errandRepo.updateStatus({
      errandId,
      status: ErrandStatus.PICKED_UP,
    });
  };

  arrivedDeliveryLocation = async (errandId: string) => {
    const errand = await this.errandRepo.updateStatus({
      errandId,
      status: ErrandStatus.ARRIVED_DELIVERY_LOCATION,
    });

    this.notification.createNotification({
      headings: { en: "Rider at delivery location" },
      contents: {
        en: "The rider has arrived the delivery location with the package",
      },
      data: { errandId: errand?._id },
      userId: errand?.customer,
    });
  };

  delivered = async (errandId: string) => {
    const errand = await this.errandRepo.updateStatus({
      errandId,
      status: ErrandStatus.DELIVERED,
    });

    this.notification.createNotification({
      headings: { en: "Package delivered" },
      contents: {
        en: "Thank you for trusting InMinutes",
      },
      data: { errandId: errand?._id },
      userId: errand?.customer,
    });

    return errand;
  };

  cancel = async (errandId: string) => {
    return await this.errandRepo.updateStatus({
      errandId,
      status: ErrandStatus.CANCELLED,
    });
  };
}

export const errandService = new ErrandService();