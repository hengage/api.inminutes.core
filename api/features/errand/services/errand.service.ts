import { HandleException, STATUS_CODES } from "../../../utils";
import { ICreateErrandData } from "../errand.interface";
import { ErrandRepository } from "../repository/errand.repo";

export class ErrandService {
  private errandRepo: ErrandRepository;
  constructor() {
    this.errandRepo = new ErrandRepository();
  }

  create = async (createErranddata: ICreateErrandData) => {
    return await this.errandRepo.create(createErranddata);
  };

  getErrand = async (errandId: string) => {
    const errand = await this.errandRepo.getErrand(errandId);
    if (!errand) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Errand not found");
    }

    return errand
  };
}
