import joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { ORDER_STATUS, HTTP_STATUS_CODES, SORT_ORDER } from "../../../constants";

export class ValidateAdminOpsOrders {
    static getList = async (getListData: { page: number, searchQuery: string, fromDate: string, toDate: string, sort: 'asc' | 'desc' }) => {
        const schema = joi.object({
            page: joi.number().integer().min(1).label("Page"),
            searchQuery: joi.string().optional().allow('').label("Search Query"),
            fromDate: joi.string().optional().allow('').label("From Date"),
            toDate: joi.string().optional().allow('').label("To Date"),
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

    static getDetails = async (getDetailsData: { orderId: string }) => {
        const schema = joi.object({
            orderId: joi.string().required().label("Order ID"),
        });

        const { error } = schema.validate(getDetailsData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };

    static assignRider = async (assignRiderData: { orderId: string, riderId: string }) => {
        const schema = joi.object({
            orderId: joi.string().required().label("Order ID"),
            riderId: joi.string().required().label("Rider ID"),
        });

        const { error } = schema.validate(assignRiderData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };

    static updateStatus = async (updateStatusData: { orderId: string, status: ORDER_STATUS }) => {
        const schema = joi.object({
            orderId: joi.string().required().label("Order ID"),
            status: joi.string().valid(...Object.values(ORDER_STATUS))
                .required().label("Status")
                .messages({
                    "any.only": Msg.ERROR_INVALID_ORDER_STATUS()
                }),
        });

        const { error } = schema.validate(updateStatusData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };
}


