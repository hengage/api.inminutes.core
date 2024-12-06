import { Coordinates } from "../../../types";
import { IWorkAreaDocument, WorkArea } from "../../riders";

export const adminOpsWorkAreaService = {
    async addWorkArea(workAreaData: addWorkAreaData):
        Promise<Partial<IWorkAreaDocument>> {
        const workArea = await WorkArea.create(
            {
                name: workAreaData.name,
                location: {
                    coordinates: workAreaData.coordinates,
                },
                maxSlotsRequired: workAreaData.maxSlotsRequired,
            }
        )

        return {
            _id: workArea._id,
            name: workArea.name,
            maxSlotsRequired: workArea.maxSlotsRequired,
        };
    }
}

export interface addWorkAreaData {
    name: string;
    coordinates: Coordinates;
    maxSlotsRequired: number;
}