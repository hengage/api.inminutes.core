import { ClientSession } from "mongoose";
import { convertLatLngToCell, emitEvent } from "../../../services";
import {
  HandleException,
  STATUS_CODES,
  calculateAverageRating,
  compareValues,
} from "../../../utils";
import { Rider } from "../models/riders.model";
import { ICreateRiderData, IRiderDocument } from "../riders.interface";

/**
Repository for rider-related database operations.
@class
*/
export class RidersRepository {
  /**
  @async
  Checks if a rider with the given email already exists on signup.
  @param {string} email - The email to check for.
  */
  async checkEmailIstaken(email: string) {
    const rider = await Rider.findOne({ email }).select("email").lean();

    if (rider) {
      throw new HandleException(STATUS_CODES.CONFLICT, "Email already taken");
    }

    return;
  }

  /**
   * @async
  Checks if a rider with the given phone number already exists.
  @param {string} phoneNumber - The phone number to check for.
  */
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

  /**
  @async
  Creates a new rider account.
  @param {object} riderData - The rider data.
  */
  async signup(riderData: ICreateRiderData): Promise<Partial<IRiderDocument>> {
    const rider = await Rider.create(riderData);

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

  /**
  @async
  Logs in a rider.
  @param {object} loginData - The login data.
  */
  async login(loginData: { email: string; password: string }) {
    const { email, password } = loginData;
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

  /**
  @async
  Retrieves a rider's document by ID.
  @param {string} id - The rider ID.
  */
  async getMe(id: string): Promise<IRiderDocument> {
    const rider = await Rider.findById(id)
      .select("-updatedAt -password -accountStatus -location -__v")
      .lean();

    if (!rider) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Rider not found");
    }

    return rider;
  }

  /**
  @async
  Updates a rider's location.
  @param {string} params.riderId - The ID of the rider to update.
  @param {number[]} params.coordinates - The new latitude and longitude coordinates for the rider.
  */
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

  /**
  @async
  Finds nearby riders based on the given coordinates and distance.
  @param {number[]} params.coordinates - The latitude and longitude coordinates to search from.
  @param {number} params.distanceInKM - The maximum distance in kilometers to search within.
  */
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

  /**
  @async
  Updates a rider's availability to work and receive orders.
  @param {string} params.riderId - The ID of the rider to update.
  @param {boolean} params.currentlyWorking - Whether the rider is currently 
  available to work and receive orders.
  */
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

  /**
  @async
  Updates a rider's rating.
  @param {object} ratingData - The rating data.
  @param {ClientSession} session - The database session.
  */
  updateRating = async (
    ratingData: { riderId: string; rating: number },
    session: ClientSession
  ) => {
    const { riderId, rating } = ratingData;
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
  };
}
