import Joi from "joi";
import { validateSchema } from "../../../utils/validation.utils";
import { addWorkAreaData } from "../services/workAreaAndSessions.service";

export class ValidateAdminOpsWorkAreaAndSessions {
  static addWorkArea = (data: addWorkAreaData) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      maxSlotsRequired: Joi.number().integer().required(),
    });

    validateSchema(schema, data);
    return;
  };

  static getWorkSessionsPerArea = (data: {
    workAreaId: string;
    date: Date;
  }) => {
    const schema = Joi.object({
      workAreaId: Joi.string().required(),
      date: Joi.date().required(),
    });

    validateSchema(schema, data);
    return;
  };
}
