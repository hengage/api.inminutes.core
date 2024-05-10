import joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";
import { IVendorSignup } from "../vendors.interface";

class ValidateVendor {
  signUp = async (payload: IVendorSignup) => {
    const signUpSchema = joi
      .object({
        businessName: joi.string().required().label("Business name"),
        businessLogo: joi.string().required().label("Business logo"),
        phoneNumber: joi.string().required().label("Phone number"),
        password: joi.string().required().label("Password"),
        email: joi.string().required().label("Email"),
        address: joi.string().required().label("Address"),
        residentialAddress: joi
          .string()
          .required()
          .label("Residential address"),
        category: joi.string().required().label("Category"),
        subCategory: joi.string().label("Subcategory"),
        location: joi.array().required().label("Location"),
      })
      .unknown(false);

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

  getVendorsByCategory = async (payload: { email: string; password: string }) => {
    const schema = joi.object({
      coordinates: joi.array().required(),
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

  rate = async (payload: {rating: number}) => {
    const schema = joi.object({
      rating: joi.number().integer().min(1).max(5).required(),
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

export const validateVendor = new ValidateVendor();
