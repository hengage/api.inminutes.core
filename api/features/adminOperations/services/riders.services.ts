import { timeSlotRepo } from "../../../features/riders/repository/timeSlot.repo";
import { Coordinates } from "../../../types";
import { IWorkAreaDocument } from "../../riders";

class AdminOpsForRidersService {

    constructor() { }

    async createWorkArea(createWorkAreadata: {
        name: string;
        coordinates: Coordinates;
        maxSlotsRequired: number;
    }): Promise<IWorkAreaDocument> {
        return await timeSlotRepo.createWorkArea(
            createWorkAreadata
        );
    }
}

export const adminOpsForRidersService = new AdminOpsForRidersService();


