import { FileArray, UploadedFile } from "express-fileupload";
import { MediaService } from "../../media";
import { ICreateCustomerData } from "../customers.interface";
import { CustomersRepository } from "../repository/customers.repo";

export class CustomersService {
  private mediaService: MediaService;
  private customersRepo: CustomersRepository;

  constructor() {
    this.mediaService = new MediaService();
    this.customersRepo = new CustomersRepository();
  }

  signup = async (customerData: ICreateCustomerData) => {
    await Promise.all([
      this.customersRepo.checkEmailIstaken(customerData.email),
      this.customersRepo.checkPhoneNumberIstaken(customerData.phoneNumber),
      // Todo: check or username exists
    ]);

    return await this.customersRepo.signup(customerData);
  };

  updateProfilePhoto = async (params: {
    customerId: string;
    image: Record<string, FileArray | UploadedFile>;
  }) => {
    const { customerId, image } = params;

    const result = await this.mediaService.uploadToCloudinary(
      image,
      "display-photo",
    );

    const resultUrl = Object.values(result)[0];
    return await this.customersRepo.updateDIsplayPhoto(customerId, resultUrl);
  };
}
