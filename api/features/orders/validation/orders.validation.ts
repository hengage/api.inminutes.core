import Joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";

class ValidateOrders {
  create = async (payload: any) => {
    const schema = Joi.object({
      recipientPhoneNumber: Joi.string()
        .label("Recipient's phone number")
        .required(),
      items: Joi.array().required(),
      vendor: Joi.string().label("Vendor").required(),
      deliveryAddress: Joi.string().label("Delivery address").required(),
      deliveryLocation: Joi.array().label("Delivery location").required(),
      deliveryFee: Joi.string().label("Delivery fee").required(),
      totalProductsCost: Joi.string().label("Total products cost").required(),
      totalCost: Joi.string().label("Total cost").required(),
      instruction: Joi.string().label("Instruction"),
      type: Joi.string().label("Order type").required(),
      scheduledDeliveryTime: Joi.string().when("type", {
        is: "scheduled",
        then: Joi.string().label("Scheduled delivery time").required(),
        otherwise: Joi.forbidden(),
      }),
    });

    const { error } = schema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };

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
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };

  orderFeedback = async (payload: { rating: number }) => {
    const schema = Joi.object({
      vendorRating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .label("rating"),
      riderRating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .label("rating"),
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
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
  };
}

export const validateOrders = new ValidateOrders();
