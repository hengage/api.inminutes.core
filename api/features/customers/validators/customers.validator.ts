import joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";
import { ICustomerDocument } from "../customers.interface";

class ValidateCustomer {
  signUp = async (payload: ICustomerDocument) => {
    const signUpSchema = joi.object({
      fullName: joi.string().required(),
      displayName: joi.string().label("Display name").required(),
      phoneNumber: joi.string().label("Phone number").required(),
      email: joi.string().label("Email").required(),
      dateOfBirth: joi.string().label("Date of birth").required(),
      address: joi.string().label("Address").required(),
      password: joi.string().label("Password").required(),
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
