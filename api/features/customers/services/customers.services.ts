import { HandleException, STATUS_CODES } from "../../../utils";
import { MediaService } from "../../media";
import { CustomersRepository } from "../repository/customers.repo";

export class CustomersService {
  private mediaService: MediaService;
  private customersRepo: CustomersRepository;

  constructor() {
    this.mediaService = new MediaService()
    this.customersRepo = new CustomersRepository();
  }

  async signup(customer: any) {
    await Promise.all([
      this.customersRepo.checkEmailIstaken,
      this.customersRepo.checkPhoneNumberIstaken
    ])

    return await this.customersRepo.signup(customer)
  }
 

  async updateProfilePhoto(params: {
    customerId: string;
    image: Record<string, any>;
  }) {
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
  }
}
