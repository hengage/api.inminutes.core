import crypto from "crypto";

import { DateTime } from "luxon";

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

export {
    generateUniqueString, toLowerCaseSetter
}