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
            .get(AdminOpsForErrandsController.getList)

        this.router
            .route("/:errandId")
            .get(AdminOpsForErrandsController.getDetails);
    }
}
