import { Customer, ICustomer } from "../features/customers";
import { compareValues } from "../utils";

// const LocalStrategy = require("passport-local").Strategy

import  LocalStrategy, {Strategy} from "passport-local"
import passport  from "passport";

const localStrategy = new LocalStrategy.Strategy(
    { usernameField: "phoneNumber" },
    async (phoneNumber: string, password: string, done: Function) => {
      try {
        const customer = await Customer.findOne({phoneNumber}).select("phoneNumber password")
        console.log(customer, phoneNumber);
  
        if (!customer) {
          return done(null, false, {
            message: "Incorrect login credentials.",
          });
        }
        const passwordsMatch = await compareValues(password, customer.password)
        return passwordsMatch
          ? done(null, customer)
          : done(null, false, { message: "Incorrect login credentials." });
      } catch (error) {
        done(error);
      }
    }
  );

  const serilizeUser =  () => {
    passport.serializeUser(function (user, done) {
        done(null, user);
      });
      
      passport.deserializeUser(function (user: ICustomer, done) {
        done(null, user);
      });
  }

  const passportStrategySetup = () => {
    passport.use("local", localStrategy);
  };

  export { passportStrategySetup, serilizeUser}