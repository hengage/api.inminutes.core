import joi from "joi";
import { Msg } from "../../../utils";
import { SORT_ORDER } from "../../../constants";
import { validateSchema } from "../../../utils/validation.utils";
import { ListProductsQueryParams } from "../interfaces/product.interface";

export class ValidateAdminOpsProducts {
  static getList = async (getListData: ListProductsQueryParams) => {
    const schema = joi.object({
      page: joi
        .alternatives()
        .try(joi.number().integer().min(1), joi.string().min(1))
        .optional()
        .label("Page"),
      limit: joi
        .alternatives()
        .try(joi.number().integer().min(1), joi.string().min(1))
        .optional()
        .label("Limit"),
      searchQuery: joi.string().optional(),
      fromDate: joi.string().optional(),
      toDate: joi.string().optional(),
      maxPrice: joi.string().optional(),
      minPrice: joi.string().optional(),
      status: joi.string().optional(),
      category: joi.string().optional(),
      subCategory: joi.string().optional(),
      vendor: joi.string().optional(),
      sortOrder: joi
        .string()
        .valid(...Object.values(SORT_ORDER))
        .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
    });

    validateSchema(schema, getListData);
    return;
  };

  static getProductDetails = async (getProductDetailsData: {
    productId: string;
  }) => {
    const schema = joi.object({
      productId: joi.string().required().label("Product ID"),
    });

    validateSchema(schema, getProductDetailsData);
    return;
  };

  static createCategory = async (createCategoryData: { name: string }) => {
    const schema = joi.object({
      name: joi.string().required().label("Name"),
    });

    validateSchema(schema, createCategoryData);
    return;
  };

  static createSubCategory = async (createSubCategoryData: {
    name: string;
    category: string;
  }) => {
    const schema = joi.object({
      name: joi
        .string()
        .required()
        .messages({
          "any.required": Msg.ERROR_REQUIRED("name"),
        }),
      category: joi
        .string()
        .required()
        .messages({
          "any.required": Msg.ERROR_REQUIRED("category"),
        }),
    });

    validateSchema(schema, createSubCategoryData);
    return;
  };

  static approveProduct = async (approveProductData: { productId: string }) => {
    const schema = joi.object({
      productId: joi.string().required().label("Product ID"),
    });

    validateSchema(schema, approveProductData);
    return;
  };

  static rejectProduct = async (rejectProductData: { productId: string }) => {
    const schema = joi.object({
      productId: joi.string().required().label("Product ID"),
    });

    validateSchema(schema, rejectProductData);
    return;
  };

  static pendingProducts = async (pendingProductsData: {
    page: number | string;
  }) => {
    const schema = joi.object({
      page: joi
        .alternatives()
        .try(joi.number().integer().min(1), joi.string().min(1))
        .optional()
        .label("Page"),
    });

    validateSchema(schema, pendingProductsData);
    return;
  };
}
