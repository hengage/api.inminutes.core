import { Request, Response } from "express";
import { STATUS_CODES } from "../../../utils";
import { usersService } from "../../../services";

class AuthController {
    async checkPhoneNumberIstaken(req: Request, res: Response) {
        try {
           await usersService.isPhoneNumberTaken(req.body.phoneNumber)
           res.status(STATUS_CODES.NO_CONTENT).json({
            message: "succesful"
           })
        } catch (error: any) {
            // if ()
            res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
                message: "Failed ",
                error: error.message || "Server error"
            })
        }
    }
}

export const authController = new AuthController()