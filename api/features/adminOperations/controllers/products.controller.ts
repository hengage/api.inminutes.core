import { Request, Response } from "express";
import { capitalize, handleErrorResponse } from "../../../utils";
import { AdminOpsForProductsService } from "../services/products.services";
import { handleSuccessResponse } from "../../../utils/response.utils";
import { HTTP_STATUS_CODES } from "../../../constants";
import { ValidateAdminOpsProducts } from "../validators/adminOpsProducts.validate";
import {
  GetProductRangeFilter,
  ListProductsQueryParams,
} from "../interfaces/product.interface";
import { validateProducts } from "../../products/validators/products.validators";
import { ProductsRepository } from "../../products";

export class AdminOpsForProductsController {
  private adminOpsForProductsService: AdminOpsForProductsService;
  private productsRepo: ProductsRepository;

  constructor() {
    this.adminOpsForProductsService = new AdminOpsForProductsService();
    this.productsRepo = new ProductsRepository();
  }

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await validateProducts.addProduct(req.body);
      const product = await this.productsRepo.addProduct(
        req.body,
        req.params.vendorId
      );

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { product },
        "Product added"
      );
    } catch (error: unknown) {
      console.log("Error adding product: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      await ValidateAdminOpsProducts.createCategory(req.body);
      const category = await this.adminOpsForProductsService.createCategory(
        req.body
      );

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { category },
        `${capitalize(category.name)} category created`
      );
    } catch (error: unknown) {
      console.log("Error creating category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  createSubCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      await ValidateAdminOpsProducts.createSubCategory(req.body);
      const subCategory =
        await this.adminOpsForProductsService.createSubCategory(req.body);

      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        { subCategory },
        `${capitalize(subCategory.name)} sub category created`
      );
    } catch (error: unknown) {
      console.log("Error creating sub category: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getCategorySubCategories = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const subCategories =
        await this.adminOpsForProductsService.getCategorySubCategories(
          req.params.categoryId
        );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, subCategories);
    } catch (error: unknown) {
      console.log("Error fetching sub categories: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  approveProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await ValidateAdminOpsProducts.approveProduct({
        productId: req.params.productId,
      });
      await this.adminOpsForProductsService.approveProduct(
        req.params.productId
      );
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        `Product '${req.params.productId}' has been approved`
      );
    } catch (error: unknown) {
      console.log("Error approving product: ", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  rejectProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await ValidateAdminOpsProducts.rejectProduct({
        productId: req.params.productId,
      });
      await this.adminOpsForProductsService.rejectProduct(req.params.productId);
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.OK,
        null,
        `Product '${req.params.productId}' has been rejected`
      );
    } catch (error: unknown) {
      console.error("Error rejecting product:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getList = async (req: Request, res: Response): Promise<void> => {
    try {
      const query: ListProductsQueryParams = req.query;
      await ValidateAdminOpsProducts.getList(query);
      const products = await this.adminOpsForProductsService.getList(query);
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { products });
    } catch (error: unknown) {
      console.error("Error fetching products list:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getProductDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      await ValidateAdminOpsProducts.getProductDetails({
        productId: req.params.productId,
      });
      const { productId } = req.params;
      const product =
        await this.adminOpsForProductsService.getProductDetails(productId);
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { product });
    } catch (error: unknown) {
      console.error("Error fetching product details:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  metrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.adminOpsForProductsService.metrics();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { metrics });
    } catch (error: unknown) {
      console.error("Error fetching product metrics:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  // listProductCategories = async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const categories = await this.adminOpsForProductsService.getCategories();
  //     handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { categories });
  //   } catch (error: unknown) {
  //     console.error("Error fetching product categories:", error);
  //     const { statusCode, errorJSON } = handleErrorResponse(error);
  //     res.status(statusCode).json(errorJSON);
  //   }
  // }

  listProductCategories = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { searchQuery, page, limit } = req.query;
      console.log({ page, limit });
      const categories = await this.adminOpsForProductsService.getCategories({
        searchQuery: String(searchQuery || ""),
        page: parseInt(page as string, 10) || 1,
        limit: parseInt(limit as string, 10) || 10,
      });

      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, {
        message: "Categories fetched successfully",
        ...categories,
      });
    } catch (error: unknown) {
      console.error("Error fetching product categories:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getTopProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      try {
        const filter: ListProductsQueryParams = req.query;
        await ValidateAdminOpsProducts.getList(filter);
        const products =
          await this.adminOpsForProductsService.getTopList(filter);
        handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { products });
      } catch (error: unknown) {
        console.error("Error fetching products list:", error);
        const { statusCode, errorJSON } = handleErrorResponse(error);
        res.status(statusCode).json(errorJSON);
      }
    } catch (error) {
      console.log(error);
      console.error("Error fetching top product:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getProductSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const productSummary =
        await this.adminOpsForProductsService.getProductSummary();
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { productSummary });
    } catch (error: unknown) {
      console.error("Error fetching product summary:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getProductMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate }: GetProductRangeFilter = req.query;
      const productMetrics =
        await this.adminOpsForProductsService.getProductMetrics({
          startDate,
          endDate,
        });
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { productMetrics });
    } catch (error: unknown) {
      console.error("Error fetching product metrics:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.adminOpsForProductsService.deleteProduct(req.params.productId);
      handleSuccessResponse(
        res,
        HTTP_STATUS_CODES.NO_CONTENT,
        null,
        `Product '${req.params.productId}' has been deleted`
      );
    } catch (error) {
      console.error("Error while deleting product", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };

  getTopCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const filter: ListProductsQueryParams = req.query;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      await ValidateAdminOpsProducts.getList({ ...filter, page, limit });
      const categories = await this.adminOpsForProductsService.getTopCategories(
        page,
        filter,
        limit
      );
      handleSuccessResponse(res, HTTP_STATUS_CODES.OK, { categories });
    } catch (error: unknown) {
      console.error("Error fetching top categories:", error);
      const { statusCode, errorJSON } = handleErrorResponse(error);
      res.status(statusCode).json(errorJSON);
    }
  };
}
