import joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";
import { ICustomerDocument } from "../customers.interface";

class ValidateCustomer {
  signUp = async (payload: ICustomerDocument) => {
    const signUpSchema = joi.object({
      fullName: joi.string().required(),
      displayName: joi.string().required(),
      phoneNumber: joi.string().required(),
      email: joi.string().required(),
      dateOfBirth: joi.string().required(),
      address: joi.string().required(),
      password: joi.string().required(),
    });

    const { error } = signUpSchema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
      // stripUnknown: true,
    });

    if (error) {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };

  login = async (payload: Partial<ICustomerDocument>) => {
    const loginSchema = joi.object({
      phoneNumber: joi.string().required(),
      password: joi.string().required(),
    });

    const { error } = loginSchema.validate(payload, {
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

export const validateCustomer = new ValidateCustomer();
