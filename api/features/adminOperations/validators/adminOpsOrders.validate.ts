import joi from "joi";
import { ORDER_STATUS, ORDER_TYPE, SORT_ORDER } from "../../../constants";
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
      searchQuery: joi.string().optional(),
      fromDate: joi.string().optional(),
      toDate: joi.string().optional(),
      customer: joi.string().optional(),
      rider: joi.string().optional(),
      vendor: joi.string().optional(),
      type: joi
        .string()
        .optional()
        .valid(...Object.values(ORDER_TYPE)),
      sortOrder: joi
        .string()
        .valid(...Object.values(SORT_ORDER))
        .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
      status: joi
        .string()
        .optional()
        .valid(...Object.values(ORDER_STATUS)),
      onlyOngoing: joi
        .boolean()
        .optional()
        .when("status", {
          is: joi.exist(),
          then: joi.forbidden().messages({
            "any.unknown": `{{#label}} is forbidden when status exists in the query`,
          }),
          otherwise: joi.optional(),
        })
        .valid(true)
        .messages({ "any.only": Msg.ERROR_FIELD_MUST_BE_TRUE("{{#label}}") }),
    });

    validateSchema(schema, getListData);
    return;
  };

  static getDetails = async (getDetailsData: { orderId: string }) => {
    const schema = joi.object({
      orderId: joi.string().required(),
    });

    validateSchema(schema, getDetailsData);
    return;
  };

  static assignRider = async (assignRiderData: {
    orderId: string;
    riderId: string;
  }) => {
    const schema = joi.object({
      orderId: joi.string().required(),
      riderId: joi.string().required(),
    });

    validateSchema(schema, assignRiderData);
    return;
  };

  static updateStatus = async (updateStatusData: {
    orderId: string;
    status: ORDER_STATUS;
  }) => {
    const schema = joi.object({
      orderId: joi.string().required(),
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
