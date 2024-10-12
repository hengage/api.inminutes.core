export const Msg = {
  ERROR_NO_USER_FOUND(data: unknown) {
    return `No user found at (${JSON.stringify(data)})`;
  },

  ERROR_NO_USER_FOUND_WITH_PHONE_NUMBER(data: unknown) {
    return `No user found with phone number (${JSON.stringify(data)})`;
  },

  ERROR_RIDER_NOT_FOUND(data: unknown) {
    return `No rider found at (${JSON.stringify(data)})`;
  },

  ERROR_VENDOR_NOT_FOUND(data: unknown) {
    return `No vendor found at (${JSON.stringify(data)})`;
  },
  ERROR_AUNAUTHORIZED_USER() {
    return "Unauthorized user";
  },

  ERROR_TOO_MANY_REQUESTS() {
    return "Too many requests, try again later";
  },
  ERROR_INVALID_LOGIN_CREDENTIALS() {
    return "Invalid credentials";
  },
  ERROR_UNAUTHORIZED_USER() {
    return "Unauthorized user";
  },
  ERROR_EMAIL_TAKEN(email: string) {
    return `Email ${email} already taken by an existing user.`;
  },

  ERROR_NO_WALLET_FOUND(id: string) {
    return `Wallet with id '${id}' not found`;
  },

  ERROR_PRODUCT_NOT_FOUND(id: string) {
    return `Product with id '${id}' not found`;
  },
  ERROR_INVALID_USER_TYPE(userType: string) {
    return `Invalid user type '${userType}'`;
  },
  ERROR_SCHEDULED_FORBIDDEN() {
    return "Scheduled pickup time is forbidden when errand type is not sheduled";
  },
  ERROR_INVALID_PHONE_FORMAT() {
    return "Invalid phone number format"
  },

  ERROR_INVALID_EMAIL_FORMAT() {
    return "Invalid email format"
  },
  ERROR_INVALID_PASSWORD_FORMAT() {
    return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  },
  ERROR_USER_TYPE_MISSING() {
    return "User type is required";
  },
  WALLET_CREDITED(amount: string) {
    return (
      `${amount} has been successfully credited to your wallet. ` +
      `Head to your dashboard to see your new balance`
    );
  },
};
