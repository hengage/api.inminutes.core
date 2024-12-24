import { ErrorCode, SuccessCode } from "./types";

export const HTTP_STATUS_CODES: Record<ErrorCode, number> &
  Record<SuccessCode, number> = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export enum PAYMENT_OPTIONS {
  BANK_TRANSFER = "bank transfer",
}

export enum ACCOUNT_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum USER_APPROVAL_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum PRODUCT_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum WALLET_STATUS {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  CLOSED = "closed",
}

export enum CASHOUT_CHANNEL {
  BANK_TRANSFER = "bank transfer",
  MOBILE_MONEY = "mobile money",
}

export enum PAYMENT_CHANNELS {
  CARD = "card",
  USSD = "ussd",
  BANK_TRANSFER = "bank_transfer",
}

export enum ORDER_STATUS {
  PENDING = "pending",
  REQUEST_CONFIRMED = "request confirmed",
  READY = "ready",
  PICKED_UP = "picked up",
  IN_TRANSIT = "in transit",
  NEARBY = "nearby",
  ARRIVED = "arrived",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum ORDER_TYPE {
  INSTANT = "instant",
  SCHEDULED = "scheduled",
}

export enum RIDER_WORK_SLOT_STATUS {
  PENDING = "pending",
  STARTED = "started",
  FINISHED = "finished",
  CANCELLED = "cancelled",
}

export enum PAYMENT_PURPOSE {
  ORDER = "order",
  ERRAND = "errand",
}

export enum ErrandStatus {
  PENDING = "pending",
  RIDER_ASSIGNED = "rider assigned",
  PICKED_UP = "picked up",
  IN_TRANSIT = "in transit",
  NEARBY = "nearby",
  ARRIVED_DELIVERY_LOCATION = "arrived delivery location",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum DISPATCH_TYPE {
  ORDER = "order",
  ERRAND = "errand",
}

export enum RATE_LIMIT_WINDOW_MS {
  DEFAULT = 15 * 60 * 1000, // 15 minutes
  CASHOUT_LIMIT = 60 * 60 * 1000, // 1 hour
}

export enum JWTConfig {
  ACCESS_TOKEN_EXPIRES_IN = "1h",
  REFRESH_TOKEN_EXPIRES = "1d",
}

export enum Events {
  CREATE_WALLET = "create-wallet",
  VENDOR_UNFULLFILED_ORDERS = "vendor-new-orders",
  WALLET_BALANCE = "wallet-balance",
  CREDIT_RIDER = "credit-rider",
  CREDIT_VENDOR = "credit-vendor",
  NOTIFY_VENDOR_OF_ORDER = "notify-vendor-of-new-order",
}

export enum USER_TYPE {
  CUSTOMER = "customer",
  VENDOR = "vendor",
  RIDER = "rider",
}

export enum GEOLOCATION {
  POINT = "point",
  LOCATION_INDEX = "2dsphere",
  MAX_DISTANCE_TO_SEARCH = 17000,
}

export enum DB_SCHEMA {
  CUSTOMER = "Customer",
  VENDOR = "Vendor",
  RIDER = "Rider",
  WALLET = "Wallet",
  TRANSACTION = "Transaction",
  ORDER = "Order",
  VENDOR_CATEGORY = "VendorCategory",
  VENDOR_SUB_CATEGORY = "VendorSubCategory",
  PRODUCT = "Product",
  PRODUCT_CATEGORY = "ProductCategory",
  WISHLIST = "WishList", //Todo: use lowercase 'l' for wishlist
  ERRAND = "Errand",
  ERRAND_PACKAGE_TYPE = "ErrandPackageType",
  ORDER_FEEDBACK = "OrderFeedback",
  WORK_AREA = "WorkArea",
  WORK_TIME_SESSION = "WorkTimeSession",
  RIDER_BOOKING = "RiderBooking",
}

export enum SORT_ORDER {
  ASC = 'asc',
  DESC = 'desc'
}

export enum AGENDA {
  START_WORK_SCHEDULE = "start-work-schedule",
  END_WORK_SCHEDULE = "end-work-schedule",
  SCHEDULE_DISPATCH_PICKUP = "schedule-dispatch-pickup",
}

export enum Currency {
  NGN = "NGN",
}

export enum TRANSACTION_TYPE {
  DEBIT = "debit",
  CREDIT = "credit",
}

export enum OTP_CHANNEL {
  SMS = "SMS",
}

export enum WORK_SLOT_SESSIONS {
  FIRST = "9am-12pm",
  SECOND = "12pm-3pm",
  THIRD = "3pm-6pm",
  FOURTH = "6pm-9pm",
}


export const QUERY_LIMIT = 30
