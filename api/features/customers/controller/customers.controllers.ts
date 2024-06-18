import { Request, Response, response } from "express";
import { CustomersRepository } from "../repository/customers.repo";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { ValidateCustomer } from "../validators/customers.validator";
import { CustomersService } from "../services/customers.services";
import { CustomersAuthentication } from "../auth/customers.auth";
import { ProductsRepository } from "../../products";

export class CustomersController {
  private validateCustomer: ValidateCustomer
  private customersAuthentication: CustomersAuthentication
  private customersRepo: CustomersRepository
  private customersService: CustomersService
  private productsRepo: ProductsRepository

  constructor() {
    this.validateCustomer = new ValidateCustomer();
    this.customersAuthentication = new CustomersAuthentication();
    this.customersRepo = new CustomersRepository();
    this.customersService = new CustomersService();
    this.productsRepo = new ProductsRepository();
  }


  async signupVerificationCode(req: Request, res: Response) {
    const { recipientPhoneNumber } = req.body;

    try {
      await this.customersAuthentication.sendVerificationCode(recipientPhoneNumber);
      res.status(STATUS_CODES.OK).json({
        message: "OTP sent",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async signup(req: Request, res: Response) {
    try {
      await this.validateCustomer.signUp(req.body);
      const customer = await this.customersService.signup(req.body);
      const jwtPayload = {
        _id: customer._id,
        phoneNumber: customer.phoneNumber,
      };

      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");
      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: {
          customer: { _id: customer._id },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getProfile(req: Request, res: Response) {
    const _id = (req as any).user._id;
    try {
      const customer = await this.customersRepo.getProfile(_id);
      res.status(STATUS_CODES.OK).json({
        message: "Fetched customer profile",
        data: { customer },
      });
    } catch (error: any) {
      res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
        message: "Error getting profile",
        error: error.message || "Server error",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    const customer = (req as any).user._id;

    try {
      await this.validateCustomer.updateProfile(req.body);
      const profile = await this.customersRepo.updateProfile(customer, req.body);
      res.status(STATUS_CODES.OK).json({
        message: "Success",
        data: { profile },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async updateDIsplayPhoto(req: Request, res: Response) {
    const customerId = (req as any).user._id;
    const image = req.files as Record<string, any>;

    try {
      const customer = await this.customersService.updateProfilePhoto({
        customerId,
        image,
      });
      res.status(200).json({
        message: "Success",
        data: { customer },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async updateDeliveryAddress(req: Request, res: Response) {
    const customerId = (req as any).user._id;
    const { address, coordinates } = req.body;

    try {
      const customer = await this.customersRepo.updateDeliveryAddress({
        customerId,
        address,
        coordinates,
      });

      return res.status(200).json({
        message: "success",
        data: { customer },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async deleteAccount(req: Request, res: Response) {
    const customer = (req as any).user._id;

    try {
      await this.customersRepo.deleteAccount(customer);
      res.status(STATUS_CODES.OK).json({
        message: "Success",
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getWishList(req: Request, res: Response) {
    const customerId = (req as any).user._id;
    try {
      const wishList = await this.productsRepo.getWishListForCustomer(customerId);
      console.log({ wishList });
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { wishList },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
}