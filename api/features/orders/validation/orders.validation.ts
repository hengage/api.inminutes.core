import Joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";

class ValidateOrders {
  assignRiderAndUpdateStatusToPickedUp = async (payload: {
    orderId: string;
    riderId: string;
  }) => {
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
}

export const validateOrders = new ValidateOrders();
