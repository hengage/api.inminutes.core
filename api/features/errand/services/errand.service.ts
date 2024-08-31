import { ErrandStatus } from "../../../config/constants.config";
import { NotificationService } from "../../notifications";
import { deliveryService, HandleException, STATUS_CODES } from "../../../utils";
import { ICreateErrandData } from "../errand.interface";
import { ErrandRepository } from "../repository/errand.repo";

class ErrandService {
  private errandRepo: ErrandRepository;
  private notification: NotificationService;

  constructor() {
    this.errandRepo = new ErrandRepository();
    this.notification = new NotificationService();
  }

  create = async (createErrandData: ICreateErrandData) => {
    const errand = await this.errandRepo.create(createErrandData);

    await deliveryService.handleInstantOrScheduledErrand(errand);
    return errand;
  };

  getErrand = async (errandId: string) => {
    const errand = await this.errandRepo.getErrand(errandId);
    if (!errand) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Errand not found");
    }

    return errand;
  };

  assignRider = async (data: { errandId: string; riderId: string }) => {
    await this.errandRepo.checkRiderIsAlreadyAssigned(data.errandId);
    return await this.errandRepo.assignRider(data);
  };

  pickedUpPackage = async (errandId: string) => {
    return await this.errandRepo.updateStatus({
      errandId,
      status: ErrandStatus.PICKED_UP,
    });
  };

  inTransit = async (errandId: string) => {
    const errand = await this.errandRepo.updateStatus({
      errandId,
      status: ErrandStatus.IN_TRANSIT,
    });

    this.notification.createNotification({
      headings: { en: "Package in transit" },
      contents: {
        en: "The package is in transit, on the way to your delivery location",
      },
      data: { errandId: errand?._id },
      userId: errand?.customer,
    });
  };

  nearby = async (errandId: string) => {
    const errand = await this.errandRepo.updateStatus({
      errandId,
      status: ErrandStatus.NEARBY,
    });

    this.notification.createNotification({
      headings: { en: "Package nearby" },
      contents: {
        en: "The package is nearby, please be ready to pick it up",
      },
      data: { errandId: errand?._id },
      userId: errand?.customer,
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

  getHistoryForUser = async ({
    userType,
    userId,
    page,
    limit,
  }: {
    userType: "customer" | "rider";
    userId: string;
    page?: number;
    limit?: number;
  }) => {
    const errands = await this.errandRepo.getHistoryForUser({
      userType,
      userId,
      limit,
      page,
    });
    return errands;
  };
}

export const errandService = new ErrandService();
