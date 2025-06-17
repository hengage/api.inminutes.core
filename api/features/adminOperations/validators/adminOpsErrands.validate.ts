import joi from "joi";
import { ErrandStatus, SORT_ORDER } from "../../../constants";
import { Msg } from "../../../utils";
import { validateSchema } from "../../../utils/validation.utils";
import { GetErrandsQueryParams } from "../interfaces/errands.interface";

export class ValidateAdminOpsErrands {
  static getList = (getListData: GetErrandsQueryParams) => {
    const schema = joi.object({
      page: joi
        .alternatives()
        .try(joi.number().integer().min(1), joi.string().min(1))
        .optional(),
      limit: joi
        .alternatives()
        .try(joi.number().integer().min(1), joi.string().min(1))
        .optional(),
      searchQuery: joi.string().optional(),
      fromDate: joi.string().isoDate().optional(),
      toDate: joi.string().optional(),
      customer: joi.string().optional(),
      rider: joi.string().optional(),
      packageType: joi.string().optional(),
      type: joi.string().optional(),
      status: joi
        .string()
        .optional()
        .valid(...Object.values(ErrandStatus)),
      sortOrder: joi
        .string()
        .valid(...Object.values(SORT_ORDER))
        .optional()
        .messages({ "any.only": Msg.ERROR_INVALID_SORT_ORDER() }),
      onlyOngoing: joi
        .boolean()
        .optional()
        .when("status", {
          is: joi.exist(),
          then: joi.forbidden().messages({
            "any.unknown": `{{#label}} is forbidden when status exists in the query`,
          }),
          otherwise: joi.optional(),
        })
        .valid(true)
        .messages({ "any.only": Msg.ERROR_FIELD_MUST_BE_TRUE("{{#label}}") }),
    });

    validateSchema(schema, getListData);
    return;
  };
}
