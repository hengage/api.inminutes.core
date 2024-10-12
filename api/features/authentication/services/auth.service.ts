import jwt, { decode } from "jsonwebtoken";
import { HandleException, HTTP_STATUS_CODES, generateJWTToken } from "../../../utils";
import { JWT_SECRET_KEY } from "../../../config";
import { JWTConfig } from "../../../constants";

class AuthService {
  public async refreshAccessToken(refreshToken: string) {
    console.log({ refreshToken });
    try {
      if (!refreshToken) {
        throw new HandleException(HTTP_STATUS_CODES.FORBIDDEN, "Unauthorized");
      }
      const decoded: any =  jwt.verify(refreshToken, `${JWT_SECRET_KEY}`);
      console.log({ decoded });
      const accessToken = generateJWTToken(
        { phoneNumber: decoded.phoneNumber, _id: decoded._id },
        JWTConfig.ACCESS_TOKEN_EXPIRES_IN
      );
      return accessToken;
    } catch (error: any) {
      throw new HandleException(error.status, error.message);
    }
  }
}

export const authService = new AuthService();
