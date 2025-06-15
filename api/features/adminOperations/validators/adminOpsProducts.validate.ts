import Joi from "joi";
import { Msg } from "../../../utils";
import { SORT_ORDER } from "../../../constants";
import { validateSchema } from "../../../utils/validation.utils";
import { ListProductsQueryParams } from "../interfaces/product.interface";

export class ValidateAdminOpsProducts {
  static getList = async (getListData: ListProductsQueryParams) => {
    const schema = Joi.object({
      page: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional()
        .label("Page"),
      limit: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional()
        .label("Limit"),
      searchQuery: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      maxPrice: Joi.string().optional(),
      minPrice: Joi.string().optional(),
      status: Joi.string().optional(),
      category: Joi.string().optional(),
      subCategory: Joi.string().optional(),
      vendor: Joi.string().optional(),
      sortOrder: Joi.string()
        .valid(...Object.values(SORT_ORDER))
        .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
    });

    validateSchema(schema, getListData);
    return;
  };

  static getProductDetails = async (getProductDetailsData: {
    productId: string;
  }) => {
    const schema = Joi.object({
      productId: Joi.string().required().label("Product ID"),
    });

    validateSchema(schema, getProductDetailsData);
    return;
  };

  static createCategory = async (createCategoryData: { name: string }) => {
    const schema = Joi.object({
      name: Joi.string().required().label("Name"),
    });

    validateSchema(schema, createCategoryData);
    return;
  };

  static createSubCategory = async (createSubCategoryData: {
    name: string;
    category: string;
  }) => {
    const schema = Joi.object({
      name: Joi.string()
        .required()
        .messages({
          "any.required": Msg.ERROR_REQUIRED("name"),
        }),
      category: Joi.string()
        .required()
        .messages({
          "any.required": Msg.ERROR_REQUIRED("category"),
        }),
    });

    validateSchema(schema, createSubCategoryData);
    return;
  };

  static approveProduct = async (approveProductData: { productId: string }) => {
    const schema = Joi.object({
      productId: Joi.string().required().label("Product ID"),
    });

    validateSchema(schema, approveProductData);
    return;
  };

  static rejectProduct = async (rejectProductData: { productId: string }) => {
    const schema = Joi.object({
      productId: Joi.string().required().label,
    });

    validateSchema(schema, rejectProductData);
    return;
  };

  static pendingProducts = async (pendingProductsData: {
    page: number | string;
  }) => {
    const schema = Joi.object({
      page: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional()
        .label("Page"),
    });

    validateSchema(schema, pendingProductsData);
    return;
  };
}
