import Joi from "joi";
import { validateSchema } from "../../../utils/validation.utils";
import {
  FindNearbyRidersParams,
  GetRidersQueryparams,
} from "../interfaces/rider.interface";
import {
  ACCOUNT_STATUS,
  SORT_ORDER,
  USER_APPROVAL_STATUS,
} from "../../../constants";

export class ValidateAdminOpsRiders {
  static getRiders = async (queryData: GetRidersQueryparams) => {
    const schema = Joi.object({
      vehicleType: Joi.string().optional(),
      currentlyWorking: Joi.boolean().optional(),
      accountStatus: Joi.string()
        .optional()
        .valid(...Object.values(ACCOUNT_STATUS)),
      approvalStatus: Joi.string()
        .optional()
        .valid(...Object.values(USER_APPROVAL_STATUS)),
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

  static findNearbyRiders = async (data: FindNearbyRidersParams) => {
    const schema = Joi.object({
      lng: Joi.number().required().min(-180).max(180),
      lat: Joi.number().required().min(-90).max(90),
      distanceInKM: Joi.number().required().min(0.1).max(100),
    });

    validateSchema(schema, data);
    return;
  };
}
