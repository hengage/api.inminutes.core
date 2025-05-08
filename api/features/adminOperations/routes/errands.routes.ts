import { Router } from "express"
import { AdminOpsForErrandsController } from "../controllers/errands.controller"

export class AdminOpsErrandsRoutes {
    public router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    async initializeRoutes() {
        this.router
            .route("/")
            .get(AdminOpsForErrandsController.getErrands)

        this.router
            .route("/:errandId")
            .get(AdminOpsForErrandsController.getDetails);

        this.router
            .route("/package-types")
            .post(AdminOpsForErrandsController.addPackageType);
        this.router
            .route("/package-types/:packageTypeId")
            .patch(AdminOpsForErrandsController.updatePackageType);
        this.router
            .route("/package-types/:packageTypeId")
            .delete(AdminOpsForErrandsController.deletePackageType);
    }
}
