import passport from "passport";
import { Request, Response, NextFunction } from "express";
import {
  STATUS_CODES,
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

  public  login = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    try {
      await this.validateCustomer.login(req.body);

      passport.authenticate(
        "local",
        { session: false },
        async (err: any, user: ICustomerDocument, info: any) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            return handleErrorResponse(res, {
              status: STATUS_CODES.UNAUTHORIZED,
              message: info.message,
            });
          }

          console.log({ user });
          const jwtPayload = {
            _id: user._id,
            phoneNumber: user.phoneNumber,
          };

          const accessToken = generateJWTToken(jwtPayload, "1h");
          const refreshToken = generateJWTToken(jwtPayload, "14d");

          res.status(STATUS_CODES.OK).json({
            message: "Successful",
            data: { customer: { _id: user._id }, accessToken, refreshToken },
          });
        }
      )(req, res, next);
    } catch (error: any) {
      return handleErrorResponse(res, error);
    }
  }

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
