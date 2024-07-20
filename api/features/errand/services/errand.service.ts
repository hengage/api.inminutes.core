import { deliveryService, HandleException, STATUS_CODES } from "../../../utils";
import { ICreateErrandData } from "../errand.interface";
import { ErrandRepository } from "../repository/errand.repo";

export class ErrandService {
  private errandRepo: ErrandRepository;
  constructor() {
    this.errandRepo  = new ErrandRepository();
  }


  create = async (createErrandData: ICreateErrandData) => {
    const errand = await this.errandRepo.create(createErrandData);

    await deliveryService.handleInstantOrScheduledErrand(errand)
    return errand;
  };

  getErrand = async (errandId: string) => {
    const errand = await this.errandRepo.getErrand(errandId);
    if (!errand) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Errand not found");
    }

    return errand;
  };
}
