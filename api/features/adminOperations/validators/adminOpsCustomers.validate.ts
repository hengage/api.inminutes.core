import joi from "joi";
import { Msg } from "../../../utils";
import { ACCOUNT_STATUS } from "../../../constants";
import { validateSchema } from "../../../utils/validation.utils";
import { GetCustomersQueryParams } from "../interfaces/customer.interface";

export class ValidateAdminOpsCustomers {
  static setAccountStatus = async (setAccountStatusData: {
    status: string;
  }) => {
    const schema = joi.object({
      status: joi
        .string()
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
    const schema = joi.object({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).default(10),
      searchQuery: joi.string().optional(),
      fromDateJoined: joi.string().isoDate().optional(),
      toDateJoined: joi.string().isoDate().optional(),
      status: joi
        .string()
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
