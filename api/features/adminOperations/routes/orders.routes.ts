import { Router } from "express"
import { AdminOpsForOrdersController } from "../controllers/orders.controllers"

export class AdminOpsOrdersRoutes {
    public router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    async initializeRoutes() {
        this.router
            .route("/")
            .get(AdminOpsForOrdersController.getList)
        this.router
            .route("/:orderId")
            .get(AdminOpsForOrdersController.getDetails)
        this.router
            .route('/:orderId/assign-rider')
            .patch(AdminOpsForOrdersController.assignRider)
        this.router
            .route('/:orderId/status')
            .patch(AdminOpsForOrdersController.updateStatus)
    }
}
