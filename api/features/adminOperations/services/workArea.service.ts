import { Coordinates } from "../../../types";
import { IWorkAreaDocument, RiderTimeSlotSession, WorkArea } from "../../riders";
import { IRiderTimeSlotDocument } from "../../riders/riders.interface";

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
    },

    async getWorkAreas(): Promise<Partial<IWorkAreaDocument>[]> {
        const workAreas = await WorkArea.find()
            .select('_id name maxSlotsRequired')
            .lean()
            .exec();
        return workAreas
    },

    async getWorkSlotSessionsPerArea(
        areaId: string,
        date: Date
    ): Promise<Partial<IRiderTimeSlotDocument>[]> {
        const timeSlots = await RiderTimeSlotSession.find(
            {
                area: areaId,
                date
            }
        )
            .select("")
            .lean()
            .exec();

        return timeSlots;
    },
}

export interface addWorkAreaData {
    name: string;
    coordinates: Coordinates;
    maxSlotsRequired: number;
}