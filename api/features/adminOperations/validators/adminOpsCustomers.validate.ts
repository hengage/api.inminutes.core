
import joi from "joi";
import { HandleException, Msg } from "../../../utils";
import { ACCOUNT_STATUS, HTTP_STATUS_CODES } from "../../../constants";

export class ValidateAdminOpsCustomers {
    static setAccountStatus = async (setAccountStatusData: { status: string }) => {
        const schema = joi.object({
            status: joi.string().valid(...Object.values(ACCOUNT_STATUS))
                .required().label("Status")
                .messages({
                    "any.only": Msg.ERROR_INVALID_ACCOUNT_STATUS()
                }),
        });

        const { error } = schema.validate(setAccountStatusData, {
            allowUnknown: false,
            abortEarly: false,
        });

        if (error) {
            throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
        }
        return;
    };
}
