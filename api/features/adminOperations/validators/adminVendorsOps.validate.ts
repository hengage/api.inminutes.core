import Joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";

class ValidateadminVendorsOps {
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
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
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
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
  };
}

export const validateadminVendorsOps = new ValidateadminVendorsOps();
