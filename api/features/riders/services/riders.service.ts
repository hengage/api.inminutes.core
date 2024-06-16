import { ClientSession } from "mongoose";
import { UsersService } from "../../../services";
import { HandleException, STATUS_CODES } from "../../../utils";
import { NotificationService } from "../../notifications";
import { Rider } from "../models/riders.model";
import { RidersRepository } from "../repository/riders.repo";

class RidersService {
  private notificationService: NotificationService;
  private usersService: UsersService;
  private ridersRepo: RidersRepository;

  constructor() {
    this.usersService = new UsersService();
    this.notificationService = new NotificationService();
    this.ridersRepo = new RidersRepository();
  }

  async signup(riderData: any) {
    await Promise.all([
      this.usersService.isDisplayNameTaken(riderData.displayName),
      this.ridersRepo.checkEmailIstaken(riderData.email),
      this.ridersRepo.checkPhoneNumberIstaken(riderData.phoneNumber),
    ]);

    return await this.ridersRepo.signup(riderData);
  }

  async login(loginData: { email: string; password: string }) {
    return await this.ridersRepo.login(loginData);
  }

  async getMe(id: string) {
    return await this.ridersRepo.getMe(id);
    }

  async findAndNotifyRIdersOfOrder(params: {
    coordinates: [number, number];
    distanceInKM: number;
    orderId: string;
  }) {
    const { coordinates, distanceInKM, orderId } = params;
    const riders = await this.ridersRepo.findNearbyRiders({
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
    const rider = await this.ridersRepo.updateAvailability({
      riderId,
      currentlyWorking,
    });
    console.log({ rider });
    return rider;
  }

  async updateLocation(updateLocationData: {riderId: string;
    coordinates: [number, number];}) {
    const {riderId, coordinates} = updateLocationData
    await this.ridersRepo.updateLocation({ riderId, coordinates });
  }

  async updateRating(
    ratingData: { riderId: string; rating: number },
    session: ClientSession
  ) {
    return this.ridersRepo.updateRating(ratingData, session);
  }
}


export const ridersService = new RidersService();
