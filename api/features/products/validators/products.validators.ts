import Joi from "joi";
import { HandleException, STATUS_CODES } from "../../../utils";

class ValidateProducts {
  addProduct = async (payload: any) => {
    const productSchema = Joi.object({
      name: Joi.string().required().label("Name"),
      image: Joi.string().required().label("Image"),
      description: Joi.string().required(),
      quantity: Joi.number().required().label("Quantity"),
      cost: Joi.string().required().label("Cost"),
      category: Joi.string().required().label("Category"),
      addOns: Joi.array().label("Add Ons"),
      tags: Joi.array().label("Tags"),
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
