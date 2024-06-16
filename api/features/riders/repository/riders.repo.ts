import { ClientSession } from "mongoose";
import { convertLatLngToCell, emitEvent } from "../../../services";
import {
  HandleException,
  STATUS_CODES,
  calculateAverageRating,
  compareValues,
} from "../../../utils";
import { Rider } from "../models/riders.model";
import { IRiderDocument } from "../riders.interface";
import { ridersService } from "../services/riders.service";

class RidersRepository {
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
  async signup(riderData: any): Promise<Partial<IRiderDocument>> {
    const {
      fullName,
      displayName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      residentialAddress,
    } = riderData;

    const rider = await Rider.create({
      fullName,
      displayName,
      email,
      phoneNumber,
      password,
      dateOfBirth,
      residentialAddress,
    });

    emitEvent("create-wallet", {
      riderId: rider._id,
    });

    return {
      _id: rider._id,
      fullName: rider.fullName,
      displayName: rider.displayName,
      email: rider.email,
      phoneNumber: rider.phoneNumber,
    };
  }

  async login(loginData: {email: string, password: string}) {
    const {email, password} = loginData;
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

  async updateLocation(params: {
    riderId: string;
    coordinates: [number, number];
  }) {
    const { riderId, coordinates } = params;
    const rider = await Rider.findById(riderId).select("location");

    if (!rider) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "rider not found");
    }
    rider.location.coordinates = coordinates;
    rider.h3Index = convertLatLngToCell(params.coordinates);
    await rider.save();
  }

  async findNearbyRiders(params: {
    coordinates: [number, number];
    distanceInKM: number | 20;
  }) {
    const { coordinates, distanceInKM } = params;
    // const origin = convertLatLngToCell(coordinates);
    // const riders = await Rider.find({ h3Index: origin }).select("_id fullName");

    const riders = await Rider.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates },
          distanceField: "distance",
          maxDistance: distanceInKM * 1000, // convert kilometers to meters
          spherical: true,
        },
      },
      {
        $match: { currentlyWorking: true },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          phoneNumber: 1,
          distance: 1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    console.log({ riders });
    return riders;
  }

  async updateAvailability(params: {
    riderId: string;
    currentlyWorking: true | false;
  }) {
    const { riderId, currentlyWorking } = params;

    const rider = await Rider.findByIdAndUpdate(
      riderId,
      {
        $set: { currentlyWorking },
      },
      { new: true }
    )
      .select("currentlyWorking")
      .exec();

    return rider;
  }

  async updateRating(
    updateRatingDto: { riderId: string; rating: number },
    session: ClientSession
  ) {
    const { riderId, rating } = updateRatingDto;
    try {
      const rider = await Rider.findOne({
        _id: riderId,
      }).select("rating");

      if (!rider) {
        throw new HandleException(STATUS_CODES.NOT_FOUND, "Rider not found");
      }

      rider.rating.averageRating = calculateAverageRating(rider, rating);

      await rider.save({ session });
    } catch (error: any) {
      throw new HandleException(error.status, error.message);
    }
  }
}

export const ridersRepo = new RidersRepository();
