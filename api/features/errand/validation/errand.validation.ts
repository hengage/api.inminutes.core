import Joi from "joi";
import { HandleException, HTTP_STATUS_CODES } from "../../../utils";
import { ICreateErrandData } from "../errand.interface";

export class ValidateErrand {
  create = async (createErrandData: ICreateErrandData) => {
    const schema = Joi.object({
      customer: Joi.string().required(),
      packageType: Joi.array()
        .items(Joi.string())
        .label("Package type")
        .required(),
      description: Joi.string().label("Description").required(),
      receiver: Joi.object({
        name: Joi.string().label("Receiver's name").required(),
        phoneNumber: Joi.string()
          .label("Receiver's phone number")
          .required()
          .pattern(
            /^([0]{1}|\+?[2][3][4])([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/
          )
          .message("Invalid phone number format"),
      })
        .label("Receiver")
        .required(),
      pickupAddress: Joi.string().label("Pickup address").required(),
      pickupCoordinates: Joi.array()
        .items(Joi.number())
        .length(2)
        .label("Pickup coordinates")
        .required(),
      dropoffAddress: Joi.string().label("Dropoff address").required(),
      dropoffCoordinates: Joi.array()
        .items(Joi.number())
        .length(2)
        .label("Dropoff coordinates")
        .required(),
      dispatchFee: Joi.string().label("Dispatch fee").required(),
      type: Joi.string()
        .valid("instant", "scheduled")
        .label("Errand type")
        .required(),
      scheduledPickupTime: Joi.date()
        .label("Scheduled pickup time")
        .optional()
        .when("type", {
          is: "scheduled",
          then: Joi.required(),
          otherwise: Joi.forbidden().messages({
            "any.unknown":
              "Scheduled pickup time is forbidden when errand type is not sheduled",
          }),
        }),
    });

    const { error } = schema.validate(createErrandData, {
      allowUnknown: false,
      abortEarly: false,
    });

    if (error) {
      throw new HandleException(HTTP_STATUS_CODES.BAD_REQUEST, error.message);
    }
    return;
  };
}
