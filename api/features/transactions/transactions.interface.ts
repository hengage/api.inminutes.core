export interface IInitializeTransaction {
  email: string;
  amount: string;
  metadata: {
    customerId: string;
    purpose: string;
    orderId: string; //orderId represents orders for item purchase and delivery pickup
    vendorId?: string;
  };
}

export interface ICreateTransferRecipient {
  accountName: string;
  accountNumber: string;
  bankCode: string,
  currency: string;
  recipientType: string;
  metadata: {
    channel: string;
  },
}