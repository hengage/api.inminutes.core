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
    ]);

    return await this.customersRepo.signup(customerData);
  };

  updateProfilePhoto = async (params: {
    customerId: string;
    image: Record<string, any>;
  }) => {
    const { customerId, image } = params;
    const displayPhotoUrl = await this.mediaService.uploadToCloudinary(
      image,
      "display-photo"
    );
    console.log({ displayPhotoUrl });

    const updatedCustomer = await Promise.all(
      Object.values(displayPhotoUrl).map(async (url) => {
        const customer = await this.customersRepo.updateDIsplayPhoto(
          customerId,
          url
        );
        return customer;
      })
    );

    return updatedCustomer;
  };
}
