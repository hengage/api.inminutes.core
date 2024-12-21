import Joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES } from "../../../constants";
import { ICreateCategory, ICreateSubCategory } from "../services/vendorsCategory.service";

export class ValidateAdminVendorsOps {
  createCategory = async (createCategoryData: ICreateCategory) => {
    const createCategorySchema = Joi.object({
      name: Joi.string().required(),
      image: Joi.string().required(),
    });

    const { error } = createCategorySchema.validate(createCategoryData, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };

  createSubCategory = async (createSubCategoryData: ICreateSubCategory) => {
    const createSubCategorySchema = Joi.object({
      name: Joi.string().required(),
      category: Joi.string().required(),
    });

    const { error } = createSubCategorySchema.validate(createSubCategoryData, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };

  updateAccountStatus = async (updateAccountStatusData: { status: string }) => {
    const schema = Joi.object({
      status: Joi.string()
        .required()
        .valid(...Object.values(ACCOUNT_STATUS))
        .messages({
          "any.only": Msg.ERROR_INVALID_ACCOUNT_STATUS(),
        }),
    });

    const { error } = schema.validate(updateAccountStatusData, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
  };
}
