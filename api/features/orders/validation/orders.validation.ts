import Joi from "joi";
import { HandleException, HTTP_STATUS_CODES, Msg } from "../../../utils";
import { ORDER_TYPE } from "../../../constants";

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
  create = async (payload: any) => {
    const schema = Joi.object({
      recipientPhoneNumber: Joi.string()
        .label("Recipient's phone number")
        .required(),
      items: Joi.array().min(1).required(),
      vendor: Joi.string().label("Vendor").required(),
      deliveryAddress: Joi.string().label("Delivery address").required(),
      deliveryLocation: Joi.array()
        .items(Joi.number())
        .length(2)
        .label("Delivery location")
        .required(),
      deliveryFee: Joi.string().label("Delivery fee").required(),
      serviceFee: Joi.string().label("Service fee"),
      totalProductsCost: Joi.string().label("Total products cost").required(),
      totalCost: Joi.string().label("Total cost").required(),
      instruction: Joi.string().label("Instruction"),
      type: Joi.string()
        .valid(ORDER_TYPE.INSTANT, ORDER_TYPE.SCHEDULED)
        .label("Order type")
        .required(),
      scheduledDeliveryTime: Joi.string().when("type", {
        is: ORDER_TYPE.SCHEDULED,
        then: Joi.string().label("Scheduled delivery time").required(),
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
  assignRider = async (payload: { orderId: string; riderId: string }) => {
    const schema = Joi.object({
      orderId: Joi.string().label("Order id").required(),
      riderId: Joi.string().label("Rider id").required(),
    });

    const { error } = schema.validate(payload, {
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
  orderFeedback = async (payload: { rating: number }) => {
    const schema = Joi.object({
      vendorRating: Joi.number().integer().min(1).max(5).label("rating"),
      riderRating: Joi.number().integer().min(1).max(5).label("rating"),
      remarkOnVendor: Joi.string().label("remark on vendor"),
      remarkOnRider: Joi.string().label("remark on rider"),
      vendorId: Joi.string()
        .when("vendorRating", {
          then: Joi.string().required(),
        })
        .label("Vendor"),
      riderId: Joi.string()
        .when("riderRating", {
          then: Joi.string().required(),
        })
        .label("Rider"),
    });

    const { error } = schema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };
}
