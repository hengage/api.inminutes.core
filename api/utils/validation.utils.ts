import joi from "joi";
import { HTTP_STATUS_CODES } from "../constants";
import { HandleException } from "./handleException.utils";

export const validateSchema = (schema: joi.ObjectSchema, data: object) => {
  const { error } = schema.validate(data, {
    allowUnknown: false,
    abortEarly: true,
  });

  if (error) {
    throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
  }
};
