import { ICreateErrandData } from "../errand.interface";
import { ErrandRepository } from "../repository/errand.repo";

export class ErrandService {
    private errandRepo:  ErrandRepository
    constructor() {
        this.errandRepo = new ErrandRepository();
    }
    
    create = async (createErranddata: ICreateErrandData) => {
        return await this.errandRepo.create(createErranddata)
    }
}