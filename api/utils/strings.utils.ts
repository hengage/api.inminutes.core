import crypto from "crypto";
import bcrypt from "bcrypt";
import { DateTime } from "luxon";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config";

function generateUniqueString(length: number) {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  const hexString = randomBytes.toString("hex").slice(0, length);
  const timestamp = DateTime.now().toUnixInteger().toString().substring(6);
  const uniqueString = `${hexString}${timestamp}`;
  return uniqueString;
}

function toLowerCaseSetter(value: string): string {
  return value?.toLowerCase();
}

async function encryptValue(value: string): Promise<string> {
  // try {
  const saltRounds = 10;
  const hashedValue = await bcrypt.hash(value, saltRounds);
  return hashedValue;
  // } catch (error: any) {
  //   throw new Error(error.message);
  // }
}
async function compareValues(plainValue: string, hashValue: string) {
  return bcrypt.compare(plainValue, hashValue);
}

function generateJWTToken(payload: any, expiresIn: string): string {
  return jwt.sign(payload, `${JWT_SECRET_KEY}`, { expiresIn });
}

function generateReference() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let reference = "";

  // Generate reference with a combination of numbers and letters
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    reference += characters.charAt(randomIndex);
  }

  // Add current timestamp to the reference
  const timestamp = new Date().getTime().toString();
  reference += timestamp;
  console.log({ reference });

  return reference;
}

export {
  generateUniqueString,
  toLowerCaseSetter,
  encryptValue,
  compareValues,
  generateJWTToken,
  generateReference,
};
