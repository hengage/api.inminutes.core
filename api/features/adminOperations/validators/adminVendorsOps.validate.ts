import Joi from "joi";
import { HandleException } from "../../../utils";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES } from "../../../constants";

export class ValidateAdminVendorsOps {
  createCategory = async (payload: any) => {
    const createCategorySchema = Joi.object({
      name: Joi.string().required(),
      image: Joi.string().required(),
    });

    const { error } = createCategorySchema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };

  createSubCategory = async (payload: any) => {
    const createSubCategorySchema = Joi.object({
      name: Joi.string().required(),
      category: Joi.string().required(),
    });

    const { error } = createSubCategorySchema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };

  updateAccountStatus = async (payload: any) => {
    const schema = Joi.object({
      status: Joi.string().
        required()
        .valid(...Object.values(ACCOUNT_STATUS))
        .messages({
          "any.only":
            `Invalid status. Options are: ${Object.values(ACCOUNT_STATUS).join(", ")}`,
        }),
    });

    const { error } = schema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  }
}