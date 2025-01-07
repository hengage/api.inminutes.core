import Joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES } from "../../../constants";
import { ICreateCategory, ICreateSubCategory } from "../services/vendorsCategory.service";
import { validateSchema } from "../../../utils/validation.utils";

export class ValidateAdminVendorsOps {
  createCategory = async (createCategoryData: ICreateCategory) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      image: Joi.string().required(),
    });


    validateSchema(schema, createCategoryData);
    return;
  };

  createSubCategory = async (createSubCategoryData: ICreateSubCategory) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      category: Joi.string().required(),
    });

    const { error } = schema.validate(createSubCategoryData, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    validateSchema(schema, createSubCategoryData);
    return;
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

    validateSchema(schema, updateAccountStatusData);
    return;
  };
}
