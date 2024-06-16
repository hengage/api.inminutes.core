import { Request, Response } from "express";
import {
  STATUS_CODES,
  generateJWTToken,
  handleErrorResponse,
} from "../../../utils";
import { vendorsRepo } from "../repository/vendors.repo";
import { vendorsService } from "../services/vendor.services";
import { validateVendor } from "../validators/vendors.validators";

class VendorsController {
  async signup(req: Request, res: Response) {
    try {
      await validateVendor.signUp(req.body);

      await Promise.all([
        vendorsService.checkEmailIstaken(req.body.email),
        vendorsService.checkPhoneNumberIstaken(req.body.phoneNumber),
      ]);

      const vendor = await vendorsRepo.signup(req.body);

      const jwtPayload = { _id: vendor._id, phoneNumber: vendor.phoneNumber };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(STATUS_CODES.CREATED).json({
        message: "Success",
        data: { vendor, accessToken, refreshToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      await validateVendor.login(req.body);
      const vendor = await vendorsRepo.login(req.body.email, req.body.password);

      const jwtPayload = { _id: vendor._id, PhoneNumber: vendor.phoneNumber };
      const accessToken = generateJWTToken(jwtPayload, "1h");
      const refreshToken = generateJWTToken(jwtPayload, "14d");

      res.status(STATUS_CODES.OK).json({
        message: "Login successful",
        data: { vendor, accessToken, refreshToken },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getMe(req: Request, res: Response) {
    const id = (req as any).user._id;
    try {
      const vendor = await vendorsRepo.getMe(id);
      res.status(STATUS_CODES.OK).json({
        message: "Success",
        data: { vendor },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const vendor = (req as any).user;
    try {
      const products = await vendorsService.getProducts(vendor._id, page);
      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { products },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getNearByVendors(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const vendors = await vendorsRepo.findVendorsByLocation({
        page,
        limit,
        coordinates: req.body.coordinates,
      });

      res.status(STATUS_CODES.OK).json({
        message: "message",
        data: { vendors },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

  async getVendorsByCategory(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    try {
      await validateVendor.getVendorsByCategory(req.body)
      const vendors = await vendorsRepo.getVendorsByCategory({
        categoryId: req.params.categoryId,
        page,
        coordinates: req.body.coordinates
      });

      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { vendors },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }
  
  async getVendorsBySubCategory(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    try {
      const vendors = await vendorsRepo.getVendorsBySubCategory({
        subCategoryId: req.params.subCategoryId,
        page,
        coordinates: req.body.coordinates
      });

      // console.log(vendors)

      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { vendors },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }


  async getProductsAndGroupByCategory(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    try {
      const products = await vendorsService.getProductsAndGroupByCategory(
        {vendorId: req.params.vendorId, page, limit}
      );

      res.status(STATUS_CODES.OK).json({
        message: "success",
        data: { products },
      });
    } catch (error: any) {
      handleErrorResponse(res, error);
    }
  }

}

export const vendorsController = new VendorsController();
