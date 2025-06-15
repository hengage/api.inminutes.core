import Joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { HTTP_STATUS_CODES, ORDER_TYPE } from "../../../constants";
import { ICreateOrderData } from "../orders.interface";

/**
Validates orders using Joi schemas.
@class
*/
export class ValidateOrders {
  /** 
  Validates the create order payload.
  @param {object} payload - The create order payload.
  @throws {HandleException error} If the payload is invalid.
  */
  create = async (payload: ICreateOrderData) => {
    const schema = Joi.object({
      recipientPhoneNumber: Joi.string().required(),
      items: Joi.array().min(1).required(),
      vendor: Joi.string().required(),
      deliveryAddress: Joi.string().required(),
      deliveryLocation: Joi.array().items(Joi.number()).length(2).required(),
      deliveryFee: Joi.string().required(),
      serviceFee: Joi.string(),
      totalProductsCost: Joi.string().required(),
      totalCost: Joi.string().required(),
      instruction: Joi.string(),
      type: Joi.string()
        .valid(ORDER_TYPE.INSTANT, ORDER_TYPE.SCHEDULED)
        .required(),
      scheduledDeliveryTime: Joi.string().when("type", {
        is: ORDER_TYPE.SCHEDULED,
        then: Joi.string().required().messages({
          "any.required": Msg.ERROR_SCHEDULED_REQUIRED(),
        }),
        otherwise: Joi.forbidden().messages({
          "any.unknown": Msg.ERROR_SCHEDULED_FORBIDDEN(),
        }),
      }),
    });

    const { error } = schema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };

  /**
  Validates the assign rider payload.
  @param {object} payload - The assign rider payload.
  @throws {HandleException error} If the payload is invalid.
  */
  assignRider = async (assignRiderData: {
    orderId: string;
    riderId: string;
  }) => {
    const schema = Joi.object({
      orderId: Joi.string().required(),
      riderId: Joi.string().required(),
    });

    const { error } = schema.validate(assignRiderData, {
      allowUnknown: false,
      abortEarly: false,
      // stripUnknown: true,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };

  /**
  Validates the order feedback payload.
  @param {object} payload - The order feedback payload.
  @throws {HandleException} If the payload is invalid.
  */
  orderFeedback = async (orderFeedbackData: { rating: number }) => {
    const schema = Joi.object({
      vendorRating: Joi.number().integer().min(1).max(5),
      riderRating: Joi.number().integer().min(1).max(5),
      remarkOnVendor: Joi.string(),
      remarkOnRider: Joi.string(),
      vendorId: Joi.string().when("vendorRating", {
        then: Joi.string().required(),
      }),
      riderId: Joi.string().when("riderRating", {
        then: Joi.string().required(),
      }),
    });

    const { error } = schema.validate(orderFeedbackData, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };
}
