import joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";
import { IVendorSignup } from "../vendors.interface";

class ValidateVendor {
  signUp = async (payload: IVendorSignup) => {
    const signUpSchema = joi.object({
      businessName: joi.string().required(),
      businessLogo: joi.string().required(),
      phoneNumber: joi.string().required(),
      password: joi.string().required(),
      email: joi.string().required(),
      address: joi.string().required(),
      residentialAddress: joi.string().required(),
      location: joi.array().required(),
    }).unknown(false);

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

  login = async (payload: { email: string; password: string }) => {
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

export const validateVendor = new ValidateVendor();
