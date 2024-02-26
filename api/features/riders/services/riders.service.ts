import { HandleException, STATUS_CODES } from "../../../utils";
import { Rider } from "../models/riders.model";

class RidersService {
  async checkEmailIstaken(email: string) {
    const rider = await Rider.findOne({ email })
      .select('email')
      .lean();

    if (rider) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "Email already taken"
      );
    }

    return;
  }

  async checkPhoneNumberIstaken(phoneNumber: string) {
    const rider = await Rider.findOne({ phoneNumber })
      .select('phoneNumber')
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
}

export const ridersService = new RidersService();
