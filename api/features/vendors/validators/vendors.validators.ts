import joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";

class ValidateVendor {
  signUp = async (payload: any) => {
    const signUpSchema = joi.object({
      businessName: joi.string().required(),
      businessLogo: joi.string().required(),
      phoneNumber: joi.string().required(),
      password: joi.string().required(),
      email: joi.string().required(),
      address: joi.string().required(),
      location: joi.array().required(),
    });

    const { error } = signUpSchema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };
}

export const validateVendor = new ValidateVendor();
