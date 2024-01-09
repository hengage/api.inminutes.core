import { Customer, ICustomerDocument } from "../features/customers";
import { compareValues } from "../utils";

import { Strategy } from "passport-local";
import passport from "passport";

const localStrategy = new Strategy(
  { usernameField: "phoneNumber" },
  async (phoneNumber: string, password: string, done: Function) => {
    try {
      const customer = await Customer.findOne({ phoneNumber })
        .select("phoneNumber password")
        .lean();

      if (!customer) {
        return done(null, false, {
          message: "Incorrect login credentials.",
        });
      }
      const passwordsMatch = await compareValues(password, customer.password);
      return passwordsMatch
        ? done(null, customer)
        : done(null, false, { message: "Incorrect login credentials." });
    } catch (error) {
      done(error);
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
