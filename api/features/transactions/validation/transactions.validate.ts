import Joi from "joi";
import {
  IInitializeTransaction,
  InitializeCashoutTransferData,
} from "../transactions.interface";
import { HandleException } from "../../../utils";
import { HTTP_STATUS_CODES, PAYMENT_PURPOSE } from "../../../constants";

class ValidateTransactions {
  initializeTransaction = async (payload: IInitializeTransaction) => {
    const schema = Joi.object().keys({
      email: Joi.string()
        .email()
        .required()
        .pattern(
          /^[a-zA-Z0-9.!#$%&’*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        )
        .message("Invalid email format"),
      amount: Joi.string().required(),
      metadata: Joi.object()
        .keys({
          customerId: Joi.string().required(),
          reason: Joi.string()
            .required()
            .valid(
              PAYMENT_PURPOSE.PRODUCT_PURCHASE,
              PAYMENT_PURPOSE.PACKAGE_DELIVERY,
            ),
          orderId: Joi.string().required(),
          vendorId: Joi.string().when("reason", {
            is: PAYMENT_PURPOSE.PRODUCT_PURCHASE,
            then: Joi.string().required(),
            otherwise: Joi.forbidden().messages({
              "any.unknown":
                "vendorId is forbidden when reason for payment is not for product purchase",
            }),
          }),
        })
        .required(),
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

  cashoutTransfer = async (
    cashoutTransferData: InitializeCashoutTransferData,
  ) => {
    const schema = Joi.object({
      amount: Joi.number().label("Amount").required().messages({
        "any.required": `"Amount" is a required field`,
      }),
      reason: Joi.string().label("Reason").required().messages({
        "any.required": `"Reason" is a required field`,
        "string.base": `"Reason" should be a type of 'text'`,
      }),
      walletId: Joi.string().label("Wallet ID").required(),
      recipientCode: Joi.string().label("Recipient Code").required(),
      bankName: Joi.string().label("Bank Name").required(),
      accountNumber: Joi.string()
        .label("Account Number")
        .required()
        .pattern(/^[0-9]{10}$/)
        .messages({
          "any.required": `"Account Number" is a required field`,
          "string.base": `"Account Number" should be a type of 'text'`,
          "string.pattern.base": `"Account Number" must be a 10-digit number`,
        }),
      accountName: Joi.string().label("Account Name").required().messages({
        "any.required": `"Account Name" is a required field`,
        "string.base": `"Account Name" should be a type of 'text'`,
      }),
    });

    const { error } = schema.validate(cashoutTransferData, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };
}

export const validateTransactions = new ValidateTransactions();
