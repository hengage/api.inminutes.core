import { ClientSession, startSession } from "mongoose";
import {
  HandleException,
  calculateAverageRating,
  compareValues,
  formatPhoneNumberforDB,
  Msg,
} from "../../../utils";
import { Rider } from "../models/riders.model";
import { ICreateRiderData, IRiderDocument } from "../riders.interface";
import {
  ACCOUNT_STATUS,
  DB_SCHEMA,
  HTTP_STATUS_CODES,
  USER_APPROVAL_STATUS,
  USER_TYPE,
} from "../../../constants";
import { walletRepo } from "../../wallet";

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
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        Msg.ERROR_EMAIL_TAKEN(email)
      );
    }

    return;
  }

  /**
   * @async
  Checks if a rider with the given phone number already exists.
  @param {string} phoneNumber - The phone number to check for.
  */
  async checkPhoneNumberIstaken(phoneNumber: string) {
    const rider = await Rider.findOne({
      phoneNumber: formatPhoneNumberforDB(phoneNumber),
    })
      .select("phoneNumber")
      .lean();

    if (rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
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
    const session = await startSession();

    try {
      return await session.withTransaction(async () => {
        const formattedPhoneNumber = formatPhoneNumberforDB(
          riderData.phoneNumber
        );
        const rider = new Rider({
          ...riderData,
          phoneNumber: formattedPhoneNumber,
          approvalStatus: USER_APPROVAL_STATUS.PENDING,
        });

        await rider.save({ session });

        await walletRepo.create(
          {
            merchantId: rider._id,
            merchantType: USER_TYPE.RIDER,
          },
          session
        );

        return {
          _id: rider._id,
          fullName: rider.fullName,
          displayName: rider.displayName,
          email: rider.email,
          phoneNumber: rider.phoneNumber,
        };
      });
    } finally {
      await session.endSession();
    }
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
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_INVALID_LOGIN_CREDENTIALS()
      );
    }

    const passwordsMatch = await compareValues(password, rider.password);
    if (!passwordsMatch) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_INVALID_LOGIN_CREDENTIALS()
      );
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
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_RIDER_NOT_FOUND(id)
      );
    }

    return rider;
  }

  /**
    @async
    Finds an active and approved rider by ID.
    @param {string} riderId - The rider ID to search for.
    */
  async findActiveRider(
    riderId: IRiderDocument["_id"],
    selectFields?: string[]
  ): Promise<IRiderDocument | null> {
    const query = Rider.findOne({
      _id: riderId,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      approvalStatus: USER_APPROVAL_STATUS.APPROVED,
    });

    if (selectFields) {
      query.select(selectFields);
    }

    const rider = await query.lean().exec();

    if (!rider) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND(DB_SCHEMA.RIDER, riderId)
      );
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
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_RIDER_NOT_FOUND(riderId)
      );
    }
    rider.location.coordinates = coordinates;
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
    console.log({ coordinates, distanceInKM });

    const riders = await Rider.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates },
          distanceField: "distance",
          maxDistance: distanceInKM * 1000, // convert kilometers to meters
          spherical: true,
          distanceMultiplier: 0.001, // convert to kilometers for result
          includeLocs: "location",
          query: {
            currentlyWorking: true,
            isDeleted: false,
            accountStatus: ACCOUNT_STATUS.ACTIVE,
            approvalStatus: USER_APPROVAL_STATUS.APPROVED,
          },
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          lastName: 1,
          phoneNumber: 1,
          distanceText: {
            $concat: [
              { $toString: { $round: ["$distance", 1] } },
              " kilometers away from pickup location",
            ],
          },
        },
      },
      {
        $limit: 15,
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
        throw new HandleException(
          HTTP_STATUS_CODES.NOT_FOUND,
          Msg.ERROR_RIDER_NOT_FOUND(riderId)
        );
      }

      rider.rating.averageRating = calculateAverageRating(rider, rating);

      await rider.save({ session });
    } catch (error: unknown) {
      if (error instanceof HandleException) {
        throw new HandleException(error.status, error.message);
      }
      throw new HandleException(
        HTTP_STATUS_CODES.SERVER_ERROR,
        Msg.ERROR_UNKNOWN_ERROR()
      );
    }
  };
}
