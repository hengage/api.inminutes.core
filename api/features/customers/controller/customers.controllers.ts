import { Request, Response, response } from "express";
import { CustomersRepository } from "../repository/customers.repo";
import {
  HTTP_STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { ValidateCustomer } from "../validators/customers.validator";
import { CustomersService } from "../services/customers.services";
import { CustomersAuthentication } from "../auth/customers.auth";
import { ProductsRepository } from "../../products";
import { handleSuccessResponse } from "../../../utils/response.utils";

export class CustomersController {
  private validateCustomer: ValidateCustomer;
  private customersAuthentication: CustomersAuthentication;
  private customersRepo: CustomersRepository;
  private customersService: CustomersService;
  private productsRepo: ProductsRepository;

  constructor() {
    this.validateCustomer = new ValidateCustomer();
    this.customersAuthentication = new CustomersAuthentication();
    this.customersRepo = new CustomersRepository();
    this.customersService = new CustomersService();
    this.productsRepo = new ProductsRepository();
  }

  signupVerificationCode = async (req: Request, res: Response) => {
    const { recipientPhoneNumber } = req.body;

    try {
      await this.customersAuthentication.sendVerificationCode(
        recipientPhoneNumber
      );
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "OTP sent",
      });
      return handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        'OTP sent"'
      );
    } catch (error: any) {
      console.error('Error sending code: ', error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  signup = async (req: Request, res: Response) => {
    try {
      await this.validateCustomer.signUp(req.body);
      const customer = await this.customersService.signup(req.body);
      const jwtPayload = {
        _id: customer._id,
        phoneNumber: customer.phoneNumber,
      };

      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      return handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { customer: { _id: customer._id }, accessToken, refreshToken },
        "Created customer account"
      );
    } catch (error: unknown) {
      console.error("Error creating customer account: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getProfile = async (req: Request, res: Response) => {
    const _id = (req as any).user._id;
    try {
      const customer = await this.customersRepo.getProfile(_id);

      return handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { customer });
    } catch (error: unknown) {
      console.error("Error getting profile: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;

    try {
      await this.validateCustomer.updateProfile(req.body);
      const profile = await this.customersRepo.updateProfile(
        customer,
        req.body
      );
      res.status(HTTP_STATUS_CODES.OK).json({
        message: "Success",
        data: { profile },
      });

      return handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {
        customer: profile,
      });
    } catch (error: unknown) {
      console.log("Error updating customer profile: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  updateDIsplayPhoto = async (req: Request, res: Response) => {
    const customerId = (req as any).user._id;
    const image = req.files as Record<string, any>;

    try {
      const customer = await this.customersService.updateProfilePhoto({
        customerId,
        image,
      });

      return handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { customer },
        "Display photo changed"
      );
    } catch (error: unknown) {
      console.error("Error updating customer photo: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  updateDeliveryAddress = async (req: Request, res: Response) => {
    const customerId = (req as any).user._id;
    const { address, coordinates } = req.body;

    try {
      const customer = await this.customersRepo.updateDeliveryAddress({
        customerId,
        address,
        coordinates,
      });

      return handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        { customer },
        "Delivery addressed updated"
      );
    } catch (error: any) {
      console.error('Error updating delivery address', error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  deleteAccount = async (req: Request, res: Response) => {
    const customer = (req as any).user._id;

    try {
      await this.customersRepo.deleteAccount(customer);
      
      return handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.NO_CONTENT,
        null,
      );
    } catch (error: any) {
      console.error('Error deleting customer account', error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getWishList = async (req: Request, res: Response) => {
    const customerId = (req as any).user._id;
    try {
      const wishList = await this.productsRepo.getWishListForCustomer(
        customerId
      );

      return handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        wishList,
      );
    } catch (error: any) {
      console.error('Error getting wishlist: ', error)
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
