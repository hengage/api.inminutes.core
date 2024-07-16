import joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";
import { ICustomerDocument } from "../customers.interface";

export class ValidateCustomer {
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
      phoneNumber: joi.string().label("Phone number").required(),
      password: joi.string().label("Password").required(),
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

  updateProfile = async (payload: Partial<ICustomerDocument>) => {
    const updateProfileSchema = joi.object({
      fullName: joi.string(),
      email: joi.string(),
      dateOfBirth: joi.string(),
      address: joi.string(),
    });

    const { error } = updateProfileSchema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };
}