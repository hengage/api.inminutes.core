import Joi from "joi";
import { GetTransactionsQueryParams } from "../interfaces/transactions.interface";
import { SORT_ORDER } from "../../../constants";
import { Msg } from "../../../utils";
import { validateSchema } from "../../../utils/validation.utils";

export class ValidateAdminOpsTransactions {
  static getList = async (query: GetTransactionsQueryParams) => {
    const schema = Joi.object({
      status: Joi.string().optional(),

      reason: Joi.string().optional(),
      type: Joi.string().optional(),
      lowestAmount: Joi.string().optional(),
      highestAmount: Joi.string().optional(),
      fromDate: Joi.string().optional(),
      toDate: Joi.string().optional(),
      searchQuery: Joi.string().optional(),
      sortOrder: Joi.string()
        .valid(...Object.values(SORT_ORDER))
        .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
      page: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional(),
      limit: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional(),
    });

    validateSchema(schema, query);
    return;
  };
}
