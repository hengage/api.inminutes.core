import { Router } from "express"
import { AdminOpsworkAreaController } from "../controllers/workArea.Controller"

export class AdminOpsWorkAreaRoutes {
    public router: Router
    private adminOpsworkAreaController: typeof AdminOpsworkAreaController

    constructor() {
        this.adminOpsworkAreaController = AdminOpsworkAreaController

        this.router = Router()
        this.initializeRoutes()
    }

    async initializeRoutes() {
        this.router.
            route("/").
            post(this.adminOpsworkAreaController.addWorkArea);
    }
}

