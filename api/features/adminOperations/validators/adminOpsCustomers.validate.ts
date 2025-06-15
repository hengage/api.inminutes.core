import Joi from "joi";
import { Msg } from "../../../utils";
import { ACCOUNT_STATUS } from "../../../constants";
import { validateSchema } from "../../../utils/validation.utils";
import { GetCustomersQueryParams } from "../interfaces/customer.interface";

export class ValidateAdminOpsCustomers {
  static setAccountStatus = async (setAccountStatusData: {
    status: string;
  }) => {
    const schema = Joi.object({
      status: Joi.string()
        .valid(...Object.values(ACCOUNT_STATUS))
        .required()
        .label("Status")
        .messages({
          "any.only": Msg.ERROR_INVALID_ACCOUNT_STATUS(),
        }),
    });

    validateSchema(schema, setAccountStatusData);
    return;
  };

  static getList = async (data: GetCustomersQueryParams) => {
    const schema = Joi.object({
      page: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional(),
      limit: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional(),
      searchQuery: Joi.string().optional(),
      fromDateJoined: Joi.string().isoDate().optional(),
      toDateJoined: Joi.string().isoDate().optional(),
      status: Joi.string()
        .valid(...Object.values(ACCOUNT_STATUS))
        .optional()
        .messages({
          "any.only": Msg.ERROR_INVALID_ACCOUNT_STATUS(),
        }),
    });

    validateSchema(schema, data);
    return;
  };
}
