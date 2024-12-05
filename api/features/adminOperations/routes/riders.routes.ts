import { Router } from "express"
import { adminOpsRidersController } from "../controllers/riders.controller"

export class AdminOpsRidersRoutes {
    public router: Router
    private adminOpsForRidersController: typeof adminOpsRidersController

    constructor() {
        this.adminOpsForRidersController = adminOpsRidersController

        this.router = Router()
        this.initializeRoutes()
    }

    async initializeRoutes() {
        // this.router
        //   .route("/:riderId/approval")
        //   .patch(this.adminOpsForRidersController.approveRider)

        this.router
            .route("/")
            .get(this.adminOpsForRidersController.getRiders)
    }
}
