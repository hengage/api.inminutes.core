import joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { IVendorSignupData } from "../vendors.interface";
import { HTTP_STATUS_CODES } from "../../../constants";

class ValidateVendor {
  signUp = async (payload: IVendorSignupData) => {
    const signUpSchema = joi
      .object({
        businessName: joi.string().required().label("Business name"),
        businessLogo: joi.string().required().label("Business logo"),
        password: joi.string().required().label("Password"),
        phoneNumber: joi
          .string()
          .required()
          .label("Phone number")
          .pattern(
            /^([0]{1}|\+?[2][3][4])([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/,
          )
          .message(Msg.ERROR_INVALID_PHONE_FORMAT()),
        email: joi
          .string()
          .required()
          .label("Email")
          .pattern(
            /^[a-zA-Z0-9.!#$%&’*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
          )
          .message(Msg.ERROR_INVALID_EMAIL_FORMAT()),
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
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
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
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };

  getVendorsByCategory = async (payload: {
    email: string;
    password: string;
  }) => {
    const schema = joi.object({
      coordinates: joi.array().required(),
    });

    const { error } = schema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
      // stripUnknown: true,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };

  rate = async (payload: { rating: number }) => {
    const schema = joi.object({
      rating: joi.number().integer().min(1).max(5).required(),
    });

    const { error } = schema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };

  update = async (payload: Partial<IVendorSignupData>) => {
    const updateSchema = joi
      .object({
        businessName: joi.string().optional().label("Business name"),
        businessLogo: joi.string().optional().label("Business logo"),
        password: joi.string().optional().label("Password"),
        phoneNumber: joi
          .string()
          .optional()
          .label("Phone number")
          .pattern(/^(\+234|0)[7-9]0\d{8}$/)
          .message(Msg.ERROR_INVALID_PHONE_FORMAT()),
        email: joi.forbidden().label("Email cannot be updated"), // ❌ Email not allowed
        address: joi.string().optional().label("Address"),
        residentialAddress: joi.string().optional().label("Residential address"),
        category: joi.string().optional().label("Category"),
        subCategory: joi.string().optional().label("Subcategory"),
        location: joi
          .array()
          .items(joi.number())
          .optional()
          .label("Location"),
      })
      .unknown(false);

    const { error } = updateSchema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };
}

export const validateVendor = new ValidateVendor();
