import { ClientSession } from "mongoose";
import { NotificationService } from "../../notifications";
import { RidersRepository } from "../repository/riders.repo";
import { UsersService } from "../../../services/users.services";
import { IOrdersDocument } from "../../orders/orders.interface";
import { IErrandDocument } from "../../errand";
import { DISPATCH_TYPE } from "../../../constants";

class RidersService {
  private notificationService: NotificationService;
  private usersService: UsersService;
  private ridersRepo: RidersRepository;

  constructor() {
    this.usersService = new UsersService();
    this.notificationService = new NotificationService();
    this.ridersRepo = new RidersRepository();
  }

  signup = async (riderData: any) => {
    await Promise.all([
      this.usersService.isDisplayNameTaken(riderData.displayName),
      this.ridersRepo.checkEmailIstaken(riderData.email),
      this.ridersRepo.checkPhoneNumberIstaken(riderData.phoneNumber),
    ]);

    return await this.ridersRepo.signup(riderData);
  };

  async login(loginData: { email: string; password: string }) {
    return await this.ridersRepo.login(loginData);
  }

  async getMe(id: string) {
    return await this.ridersRepo.getMe(id);
  }

  /**
   * Notifies nearby riders about a new dispatch job (either an order or an errand).
   * @async
   * @param params - The parameters for the notification.
   * @param params.coordinates - The coordinates to search for nearby riders.
   * @param params.distanceInKM - The search radius in kilometers.
   * @param params.dispatchId - The unique identifier of the dispatch (order or errand).
   * @param params.dispatchType - The type of dispatch, either 'order' or 'errand'.
   *                             This is used to help the client app determine which endpoint
   *                             to call for fetching the details of the dispatch.
   */
  async notifyRidersForDispatchJob(params: {
    coordinates: [number, number];
    distanceInKM: number;
    dispatchType: DISPATCH_TYPE.ORDER | DISPATCH_TYPE.ERRAND;
    dispatchId: IOrdersDocument["_id"] | IErrandDocument["_id"];
  }) {
    const { coordinates, distanceInKM, dispatchType, dispatchId } = params;
    const riders = await this.ridersRepo.findNearbyRiders({
      coordinates,
      distanceInKM,
    });

    riders.forEach((rider: any) => {
      this.notificationService.createNotification({
        headings: { en: "New Dispatch Available" },
        contents: {
          en: "A new dispatch is ready for pickup. Accept and proceed",
        },
        data: { dispatchType, dispatchId },
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

  async updateLocation(updateLocationData: {
    riderId: string;
    coordinates: [number, number];
  }) {
    const { riderId, coordinates } = updateLocationData;
    await this.ridersRepo.updateLocation({ riderId, coordinates });
  }

  async updateRating(
    ratingData: { riderId: string; rating: number },
    session: ClientSession,
  ) {
    return this.ridersRepo.updateRating(ratingData, session);
  }
}

export const ridersService = new RidersService();
