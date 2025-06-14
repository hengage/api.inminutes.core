import joi from "joi";
import { ORDER_STATUS, SORT_ORDER } from "../../../constants";
import { Msg } from "../../../utils";
import { validateSchema } from "../../../utils/validation.utils";
import { GetOrdersQueryParams } from "../interfaces/orders.interface";

export class ValidateAdminOpsOrders {
  static getList = async (getListData: GetOrdersQueryParams) => {
    const schema = joi.object({
      page: joi
        .alternatives()
        .try(joi.number().integer().min(1), joi.string().min(1))
        .optional(),
      limit: joi
        .alternatives()
        .try(joi.number().integer().min(1), joi.string().min(1))
        .optional(),
      searchQuery: joi.string().optional().allow("").label("Search Query"),
      fromDate: joi.string().optional().allow("").label("From Date"),
      toDate: joi.string().optional().allow("").label("To Date"),
      customer: joi.string().optional().allow("").label("Customer"),
      rider: joi.string().optional().allow("").label("Rider"),
      vendor: joi.string().optional().allow("").label("Vendor"),
      type: joi
        .string()
        .optional()
        .valid(...Object.values(ORDER_STATUS)),
      sort: joi
        .string()
        .valid(...Object.values(SORT_ORDER))
        .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
    });

    validateSchema(schema, getListData);
    return;
  };

  static getDetails = async (getDetailsData: { orderId: string }) => {
    const schema = joi.object({
      orderId: joi.string().required().label("Order ID"),
    });

    validateSchema(schema, getDetailsData);
    return;
  };

  static assignRider = async (assignRiderData: {
    orderId: string;
    riderId: string;
  }) => {
    const schema = joi.object({
      orderId: joi.string().required().label("Order ID"),
      riderId: joi.string().required().label("Rider ID"),
    });

    validateSchema(schema, assignRiderData);
    return;
  };

  static updateStatus = async (updateStatusData: {
    orderId: string;
    status: ORDER_STATUS;
  }) => {
    const schema = joi.object({
      orderId: joi.string().required().label("Order ID"),
      status: joi
        .string()
        .valid(...Object.values(ORDER_STATUS))
        .required()
        .label("Status")
        .messages({
          "any.only": Msg.ERROR_INVALID_ORDER_STATUS(),
        }),
    });

    validateSchema(schema, updateStatusData);
    return;
  };
}
