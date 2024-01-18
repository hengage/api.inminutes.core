import joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";
import { IRiderDocument } from "../riders.interface";

class ValidateRider {
  signUp = async (payload: Partial<IRiderDocument>) => {
    const signUpSchema = joi.object({
      fullName: joi.string().required().label("Full name"),
      displayName: joi.string().required().label("Display name"),
      phoneNumber: joi.string().required().label("Phone number"),
      email: joi.string().required().label("Email"),
      password: joi.string().required().label("Password"),
      dateOfBirth: joi.string().required().label("Date of birth"),
      residentialAddress: joi.string().required().label("Residential address"),
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

  login = async (payload: Partial<IRiderDocument>) => {
    const loginSchema = joi.object({
      email: joi.string().required(),
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

export const validateRider = new ValidateRider();
