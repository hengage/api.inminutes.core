import crypto from "crypto";
import bcrypt from "bcrypt";
import { DateTime } from "luxon";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config";
import { JWT_ALGORITHMS } from "../config/secrets.config";

export function generateUniqueString(length: number): string {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  const hexString = randomBytes.toString("hex").slice(0, length);
  const timestamp = DateTime.now().toUnixInteger().toString().substring(6);
  const uniqueString = `${hexString}${timestamp}`;
  return uniqueString;
}

export function toLowerCaseSetter(value: string): string {
  return value?.toLowerCase();
}

export async function encryptValue(value: string): Promise<string> {
  // try {
  const saltRounds = 10;
  const hashedValue = await bcrypt.hash(value, saltRounds);
  return hashedValue;
  // } catch (error: any) {
  //   throw new Error(error.message);
  // }
}
export async function compareValues(
  plainValue: string,
  hashValue: string
): Promise<boolean> {
  return bcrypt.compare(plainValue, hashValue);
}

export function generateJWTToken(payload: any, expiresIn: string): string {
  return jwt.sign(payload, `${JWT_SECRET_KEY}`, {
    algorithm: JWT_ALGORITHMS.HS256,
    expiresIn,
  });
}

export function generateReference(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let reference = "";

  // Generate reference with a combination of numbers and letters
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    reference += characters.charAt(randomIndex);
  }

  // Add current timestamp to the reference
  const timestamp = new Date().getTime().toString();
  reference += timestamp.substring(8);
  return reference;
}

/**
 * Formats a phone number for storage in the database.
 *
 * This function takes a phone number string as input and returns a formatted version
 * that is suitable for storage in the database. It removes all non-digit characters
 * from the input, and ensures that the phone number is prefixed with "234" if it
 * does not already start with "0" or "234".
 *
 * @param phoneNumber - The phone number to be formatted.
 * @returns The formatted phone number.
 */
export function formatPhoneNumberforDB(phoneNumber: string): string {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  if (digitsOnly.startsWith("0")) {
    return "234" + digitsOnly.slice(1);
  } else if (digitsOnly.startsWith("234")) {
    return digitsOnly;
  } else {
    return digitsOnly;
  }
}

/**
 * Capitalizes the first letter of each word in a string.
 */
export function capitalize(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0)
      .toUpperCase() + word.slice(1))
    .join(" ");
}