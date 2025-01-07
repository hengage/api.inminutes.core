import joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { HTTP_STATUS_CODES, SORT_ORDER } from "../../../constants";
import { GetProductsFilter } from "../services/products.services";

export class ValidateAdminOpsProducts {
    static getList = async (getListData: GetProductsFilter & { page: number | string }) => {
        const schema = joi.object({
            page: joi.alternatives().try(
                joi.number().integer().min(1),
                joi.string().min(1)
            ).optional().label("Page"),
            searchQuery: joi.string().optional().allow('').label("Search Query"),
            fromDate: joi.string().optional().allow('').label("From Date"),
            toDate: joi.string().optional().allow('').label("To Date"),
            category: joi.string().optional().allow("").label("Category"),
            vendor: joi.string().optional().allow("").label("Vendor"),
            sort: joi.string().valid(...Object.values(SORT_ORDER)).label("Sort")
                .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
        });

        const { error } = schema.validate(getListData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };

    static getProductDetails = async (getProductDetailsData: { productId: string }) => {
        const schema = joi.object({
            productId: joi.string().required().label("Product ID"),
        });

        const { error } = schema.validate(getProductDetailsData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };

    static createCategory = async (createCategoryData: { name: string }) => {
        const schema = joi.object({
            name: joi.string().required().label("Name"),
        });

        const { error } = schema.validate(createCategoryData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };

    static approveProduct = async (approveProductData: { productId: string }) => {
        const schema = joi.object({
            productId: joi.string().required().label("Product ID"),
        });

        const { error } = schema.validate(approveProductData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };

    static rejectProduct = async (rejectProductData: { productId: string }) => {
        const schema = joi.object({
            productId: joi.string().required().label("Product ID"),
        });

        const { error } = schema.validate(rejectProductData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };

    static pendingProducts = async (pendingProductsData: { page: number | string }) => {
        const schema = joi.object({
            page: joi.alternatives().try(
                joi.number().integer().min(1),
                joi.string().min(1)
            ).optional().label("Page"),
        });

        const { error } = schema.validate(pendingProductsData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };
}

