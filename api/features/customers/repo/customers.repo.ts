import { ICustomer } from "../customers.interface";
import { Customer } from "../models/customers.model";

class CustomerRepository {
    async signup (payload: any): Promise<ICustomer["_id"]> {
        const customer = await new Customer({
            firstName: payload.firstName,
            lastName: payload.lasstName,
            phoneNumber: payload.phoneNumber,
            email: payload.email,
            password: payload.password,
            dateOfBirth: payload.dateOfBirth,
            address: payload.address
        }).save()

        return customer._id
    }
}

export const customerRepo = new CustomerRepository()