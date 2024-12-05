import passport from "passport";
import { Request, Response, NextFunction } from "express";
import {
  HandleException,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { ICustomerDocument } from "../customers.interface";
import { ValidateCustomer } from "../validators/customers.validator";
import { Twilio } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SID,
} from "../../../config";
import { CustomersRepository } from "../repository/customers.repo";
import { JSONValue } from "../../../types";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";

export class CustomersAuthentication {
  private twilioClient: Twilio;
  private verifyServiceSID: string;
  private validateCustomer: ValidateCustomer;
  private customersRepo: CustomersRepository;

  constructor() {
    this.twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    this.verifyServiceSID = `${TWILIO_VERIFY_SID}`;

    this.validateCustomer = new ValidateCustomer();
    this.customersRepo = new CustomersRepository();
  }

  /**
   * @async
   * Handles customer login requests.
   * Uses Passport.js to authenticate the customer using the local strategy.
   * @param req - The request object.
   * @param res res - The response object.
   * @param next  - The next function in the middleware chain.
   */
  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.validateCustomer.login(req.body);

      passport.authenticate(
        "local",
        { session: false },
        async (
          err: unknown,
          user: ICustomerDocument,
          info: Record<string, JSONValue>
        ) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            const error = handleErrorResponse(
              new HandleException(
                HTTP_STATUS_CODES.UNAUTHORIZED,
                info.message as string
              )
            );
            return res.status(error.statusCode).json(error.errorJSON);
          }

          const jwtPayload = {
            _id: user._id,
            phoneNumber: user.phoneNumber,
          };

          const accessToken = generateJWTToken(jwtPayload, "1h");
          const refreshToken = generateJWTToken(jwtPayload, "14d");

          return handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {
            customer: { _id: user._id },
            accessToken: accessToken,
            refreshToken,
          }, 'Login successful');
        }

      )(req, res, next);
    } catch (error: unknown) {
      console.log("Error logging in customer: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  /**
   * @async
   * Sends a verification code to a recipient's phone number.
   * @param recipientPhoneNumber - The phone number to send the verification code to.
   */
  sendVerificationCode = async (recipientPhoneNumber: string) => {
    const phoneNumber = recipientPhoneNumber.substring(1);
    try {
      await this.customersRepo.checkPhoneNumberIstaken(phoneNumber);

      const verification = await this.twilioClient.verify.v2
        .services(this.verifyServiceSID)
        .verifications.create({
          to: recipientPhoneNumber,
          channel: "sms",
        });
      return verification;
    } catch (error) {
      throw error;
    }
  };
}
