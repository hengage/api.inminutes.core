import joi from "joi";
import { Msg } from "../../../utils";
import { SORT_ORDER } from "../../../constants";
import { validateSchema } from "../../../utils/validation.utils";
import { GetProductsFilter } from "../interfaces/product.interface";

export class ValidateAdminOpsProducts {
    static getList = async (getListData: GetProductsFilter & { page: number | string }) => {
        const schema = joi.object({
            page: joi.alternatives().try(
                joi.number().integer().min(1),
                joi.string().min(1)
            ).optional().label("Page"),
            limit: joi.alternatives().try(
                joi.number().integer().min(1),
                joi.string().min(1)
            ).optional().label("Limit"),
            searchQuery: joi.string().optional().allow('').label("Search Query"),
            fromDate: joi.string().optional().allow('').label("From Date"),
            toDate: joi.string().optional().allow('').label("To Date"),
            maxPrice: joi.string().optional().allow('').label("Max Price"),
            minPrice: joi.string().optional().allow('').label("Min Price"),
            status: joi.string().optional().allow('').label("Status"),
            category: joi.string().optional().allow("").label("Category"),
            vendor: joi.string().optional().allow("").label("Vendor"),
            sort: joi.string().valid(...Object.values(SORT_ORDER)).label("Sort")
                .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
        });

        validateSchema(schema, getListData);
        return;
    };

    static getProductDetails = async (getProductDetailsData: { productId: string }) => {
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

    static pendingProducts = async (pendingProductsData: { page: number | string }) => {
        const schema = joi.object({
            page: joi.alternatives().try(
                joi.number().integer().min(1),
                joi.string().min(1)
            ).optional().label("Page"),
        });

        validateSchema(schema, pendingProductsData);
        return;
    };
}

