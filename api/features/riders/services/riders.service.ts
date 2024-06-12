import { HandleException, STATUS_CODES } from "../../../utils";
import { notificationService } from "../../notifications";
import { Rider } from "../models/riders.model";
import { ridersRepo } from "../repository/riders.repo";

class RidersService {
  async checkEmailIstaken(email: string) {
    const rider = await Rider.findOne({ email }).select("email").lean();

    if (rider) {
      throw new HandleException(STATUS_CODES.CONFLICT, "Email already taken");
    }

    return;
  }

  async checkPhoneNumberIstaken(phoneNumber: string) {
    const rider = await Rider.findOne({ phoneNumber })
      .select("phoneNumber")
      .lean();

    if (rider) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        `Looks like you already have a rider account, ` +
          `please try to login instead`
      );
    }

    return;
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
      notificationService.createNotification({
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
    console.log({rider})
    return rider;
  }
}

export const ridersService = new RidersService();
