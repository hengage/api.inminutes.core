import { UsersService } from "../../../services";
import { HandleException, STATUS_CODES } from "../../../utils";
import { NotificationService } from "../../notifications";
import { Rider } from "../models/riders.model";
import { ridersRepo } from "../repository/riders.repo";

class RidersService {
  private notificationService: NotificationService;
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
    this.notificationService = new NotificationService();
  }

  async signup(riderData: any) {
    await Promise.all([
      this.usersService.isDisplayNameTaken(riderData.displayName),
      ridersRepo.checkEmailIstaken(riderData.email),
      ridersRepo.checkPhoneNumberIstaken(riderData.phoneNumber),
    ]);

    return await ridersRepo.signup(riderData);
  }

  async login(loginData: { email: string; password: string }) {
    return await ridersRepo.login(loginData);
  }

  async findAndNotifyRIdersOfOrder(params: {
    coordinates: [number, number];
    distanceInKM: number;
    orderId: string;
  }) {
    const { coordinates, distanceInKM, orderId } = params;
    const riders = await ridersRepo.findNearbyRiders({
      coordinates,
      distanceInKM,
    });

    riders.forEach((rider) => {
      this.notificationService.createNotification({
        headings: { en: "New Order Available" },
        contents: {
          en: "A new order is ready for pickup. Accept and deliver!",
        },
        data: { orderId },
        userId: rider._id,
      });
    });
  }

  async updateAvailability(params: {
    riderId: string;
    currentlyWorking: boolean;
  }) {
    const { riderId, currentlyWorking } = params;
    const rider = await ridersRepo.updateAvailability({
      riderId,
      currentlyWorking,
    });
    console.log({ rider });
    return rider;
  }
}

export const ridersService = new RidersService();
