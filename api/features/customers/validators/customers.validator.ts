import joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { ICustomerDocument } from "../customers.interface";
import { Response } from "express";
import { HTTP_STATUS_CODES } from "../../../constants";

export class ValidateCustomer {
  signUp = async (payload: ICustomerDocument) => {
    const signUpSchema = joi.object({
      fullName: joi.string().required(),
      displayName: joi.string().label("Display name").required(),
      phoneNumber: joi
        .string()
        .label("Phone number")
        .required()
        .pattern(
          /^([0]{1}|\+?[2][3][4])([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/
        )
        .message(Msg.ERROR_INVALID_PHONE_FORMAT()),
      email: joi.string().label("Email").required().pattern(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      )
        .message(Msg.ERROR_INVALID_EMAIL_FORMAT()),
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
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
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
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
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
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };
}
