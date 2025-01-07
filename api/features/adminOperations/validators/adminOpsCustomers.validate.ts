
import joi from "joi";
import { Msg } from "../../../utils";
import { ACCOUNT_STATUS } from "../../../constants";
import { validateSchema } from "../../../utils/validation.utils";

export class ValidateAdminOpsCustomers {
    static setAccountStatus = async (setAccountStatusData: { status: string }) => {
        const schema = joi.object({
            status: joi.string().valid(...Object.values(ACCOUNT_STATUS))
                .required().label("Status")
                .messages({
                    "any.only": Msg.ERROR_INVALID_ACCOUNT_STATUS()
                }),
        });

        validateSchema(schema, setAccountStatusData);
        return;
    };
}
