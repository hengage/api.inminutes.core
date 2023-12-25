import { Document } from "mongoose";

export interface ICustomer extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dateOfBirth: Date;
    address: string;

}