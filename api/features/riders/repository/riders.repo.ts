import { HandleException, STATUS_CODES, compareValues } from "../../../utils";
import { Rider } from "../models/riders.model";
import { IRiderDocument } from "../riders.interface";

class RidersRepository {
  async signup(payload: any): Promise<Partial<IRiderDocument>> {
    const {
      fullName,
      displayName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      residentialAddress,
      location,
    } = payload;

    const rider = await Rider.create({
      fullName,
      displayName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      residentialAddress,
      location: {
        coordinates: location,
      },
    });

    return {
      _id: rider._id,
      fullName: rider.fullName,
      displayName: rider.displayName,
      email: rider.email,
      phoneNumber: rider.phoneNumber,
    };
  }

  async login(email: string, password: string) {
    const rider = await Rider.findOne({ email }).select(
      "email phoneNumber password"
    );

    if (!rider) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Invalid credentials");
    }

    const passwordsMatch = await compareValues(password, rider.password);
    if (!passwordsMatch) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Invalid credentials");
    }

    return {
      _id: rider._id,
      phoneNumber: rider.phoneNumber,
    };
  }

  async getMe(id: string): Promise<IRiderDocument> {
    const rider = await Rider.findById(id)
      .select("-updatedAt -password -accountStatus -location -__v")
      .lean();

    if (!rider) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Rider not found");
    }

    return rider;
  }
}

export const ridersRepo = new RidersRepository();
