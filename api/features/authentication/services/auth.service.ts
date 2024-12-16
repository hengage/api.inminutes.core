import jwt from "jsonwebtoken";
import { HandleException, Msg, generateJWTToken } from "../../../utils";
import { JWT_SECRET_KEY } from "../../../config";
import { HTTP_STATUS_CODES, JWTConfig } from "../../../constants";

class AuthService {
  public async refreshAccessToken(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new HandleException(HTTP_STATUS_CODES.FORBIDDEN, "Unauthorized");
      }
      const decoded = jwt.verify(
        refreshToken,
        `${JWT_SECRET_KEY}`,
      ) as jwt.JwtPayload;
      console.log({ decoded });
      const accessToken = generateJWTToken(
        { phoneNumber: decoded.phoneNumber, _id: decoded._id },
        JWTConfig.ACCESS_TOKEN_EXPIRES_IN,
      );
      return accessToken;
    } catch (error: unknown) {
      if (error instanceof HandleException) {
        throw error;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HandleException(
          HTTP_STATUS_CODES.UNAUTHORIZED,
          error.message,
        );
      }
      throw new HandleException(
        HTTP_STATUS_CODES.SERVER_ERROR,
        Msg.ERROR_UNKNOWN_ERROR(),
      );
    }
  }
}
export const authService = new AuthService();
