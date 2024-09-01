import { Customer, ICustomerDocument } from "../features/customers";
import { compareValues } from "../utils";

import { Strategy } from "passport-local";
import passport from "passport";
import { INCORRECT_CREDENTIALS_MESSAGE } from "./constants.config";


const localStrategy = new Strategy(
  { usernameField: "phoneNumber" },
  async (phoneNumber: string, password: string, done: Function) => {
    try {
      const customer = await Customer.findOne(
        { phoneNumber },
        { phoneNumber: 1, password: 1 }
      ).lean();

      if (!customer) {
        return done(null, false, {
          message: INCORRECT_CREDENTIALS_MESSAGE,
        });
      }
      const passwordsMatch = await compareValues(password, customer.password);
      return passwordsMatch
        ? done(null, customer)
        : done(null, false, { message: INCORRECT_CREDENTIALS_MESSAGE });
    } catch (error) {
      console.error("Authentication error:", error);
      done(null, false, { message: "An error occurred during authentication." });
    }
    }
);

const serializeUser = () => {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: ICustomerDocument, done) {
    done(null, user);
  });
};

const passportStrategySetup = () => {
  passport.use("local", localStrategy);
};

export { passportStrategySetup, serializeUser };
