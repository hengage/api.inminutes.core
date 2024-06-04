import Joi from "joi";
import { IInitializeTransaction } from "../transactions.interface";
import { HandleException, PAYMENT_PURPOSE, STATUS_CODES } from "../../../utils";

class ValidateTransactions {
  initializeTransaction = async (payload: IInitializeTransaction) => {
    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      amount: Joi.string().required(),
      metadata: Joi.object()
        .keys({
          customerId: Joi.string().required(),
          purpose: Joi.string()
            .required()
            .valid(
              PAYMENT_PURPOSE.PRODUCT_PURCHASE,
              PAYMENT_PURPOSE.PACKAGE_DELIVERY
            ),
          orderId: Joi.string().required(),
          vendorId: Joi.string().when("purpose", {
            is: PAYMENT_PURPOSE.PRODUCT_PURCHASE,
            then: Joi.string().required(),
            otherwise: Joi.forbidden(),
          }),
        })
        .required(),
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
}

export const validateTransactions = new ValidateTransactions();
