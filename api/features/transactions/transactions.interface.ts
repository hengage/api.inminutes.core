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
