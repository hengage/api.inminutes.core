import Joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";

class ValidateProducts {
  addProduct = async (payload: any) => {
    const productSchema = Joi.object({
      name: Joi.string().required(),
      image: Joi.string().required(),
      description: Joi.string().required(),
      quantity: Joi.number().required(),
      cost: Joi.string().required(),
      category: Joi.string().required(),
      addOns: Joi.array(),
      tags: Joi.array(),
    });

    const { error } = productSchema.validate(payload, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };
}

export const validateProducts = new ValidateProducts();
