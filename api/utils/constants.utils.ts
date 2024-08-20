export const STATUS_CODES = {
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

export enum RIDER_WORK_SLOT_STATUS {
  PENDING = "pending",
  STARTED = "started",
  FINISHED = "finished",
  CANCELLED = "cancelled",
}

export enum PAYMENT_PURPOSE {
  PRODUCT_PURCHASE = "product purchase",
  PACKAGE_DELIVERY = "package delivery",
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
