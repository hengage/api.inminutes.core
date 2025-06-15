import Joi from "joi";
import { validateSchema } from "../../../utils/validation.utils";
import { GetRidersQueryparams } from "../interfaces/rider.interface";
import { ACCOUNT_STATUS, SORT_ORDER } from "../../../constants";

export class ValidateAdminOpsRiders {
  static getRiders = async (queryData: GetRidersQueryparams) => {
    const schema = Joi.object({
      vehicleType: Joi.string().optional(),
      currentlyWorking: Joi.boolean().optional(),
      accountStatus: Joi.string()
        .optional()
        .valid(...Object.values(ACCOUNT_STATUS)),
      fromDate: Joi.string().isoDate().optional(),
      toDate: Joi.string().isoDate().optional(),
      searchQuery: Joi.string().optional(),
      sortOrder: Joi.string()
        .valid(...Object.values(SORT_ORDER))
        .optional(),
      page: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional(),
      limit: Joi.alternatives()
        .try(Joi.number().integer().min(1), Joi.string().min(1))
        .optional(),
    });

    validateSchema(schema, queryData);
    return;
  };
}
