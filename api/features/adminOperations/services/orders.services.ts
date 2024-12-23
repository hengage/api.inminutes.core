
import { PaginateResult } from "mongoose"
import { Order, IOrdersDocument } from "../../orders"
import { FilterQuery } from "mongoose";
import { addDateRangeFilter, buildFilterQuery, createPaginationOptions, HandleException, Msg } from "../../../utils";
import { DB_SCHEMA, HTTP_STATUS_CODES, ORDER_STATUS } from "../../../constants";
import { RidersRepository } from "../../riders";
import { OrdersRepository } from "../../orders/repository/orders.repo";

export const AdminOpsForOrdersService = {
    async getList(page = 1, filter: GetOrdersFilter): Promise<PaginateResult<IOrdersDocument>> {
        const options = createPaginationOptions(
            page,
            {
                select: "_id  totalCost status createdAt",
                sort: { createdAt: filter.sort === 'asc' ? 1 : -1 }
            }
        );

        const filterQuery: FilterQuery<IOrdersDocument> = {};
        if (filter) {
            const { fromDate, toDate, ...otherFilters } = filter;

            // Handle date range 
            addDateRangeFilter(filterQuery, fromDate, toDate);

            // Handle other filters
            const recordFilter: Record<string, string> = Object.fromEntries(
                Object.entries(otherFilters)
                    .filter(([key, v]) => v !== undefined && key !== 'sort'),
            );

            const searchFields = ["_id", "status"];
            buildFilterQuery(recordFilter, filterQuery, searchFields);
        }

        const orders = await Order.paginate(filterQuery, options);
        return orders;
    },

    async getDetails(orderId: IOrdersDocument['_id']): Promise<IOrdersDocument> {
        const order = await Order.findById(orderId)
            .select('-__v -deliveryLocation')
            .populate({ path: DB_SCHEMA.RIDER.toLowerCase(), select: "fullName" })
            .populate({ path: DB_SCHEMA.CUSTOMER.toLowerCase(), select: "fullName" })
            .populate({ path: DB_SCHEMA.VENDOR.toLowerCase(), select: "businessName businessLogo" })
            .lean()
            .exec();

        if (!order) {
            throw new HandleException(
                HTTP_STATUS_CODES.NOT_FOUND,
                Msg.ERROR_NOT_FOUND('order', orderId)
            );
        }
        return order;
    },

    async assignRider(orderId: IOrdersDocument['_id'], riderId: string): Promise<IOrdersDocument | null> {
        const ridersRepo = new RidersRepository()

        const [order, rider] = await Promise.all([
            Order.findById(orderId).select(DB_SCHEMA.RIDER.toLocaleLowerCase()).lean(),
            ridersRepo.findActiveRider(riderId, ['_id', 'currentlyWorking'])
        ]);

        if (!order) {
            throw new HandleException(
                HTTP_STATUS_CODES.NOT_FOUND,
                Msg.ERROR_NOT_FOUND(DB_SCHEMA.ORDER, orderId)
            );
        }

        if (rider!.currentlyWorking !== true) {
            throw new HandleException(
                HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                Msg.ERROR_RIDER_NOT_WORKING(),
            )
        }

        const updatedOrder = await Order.findOneAndUpdate({ _id: orderId }, { rider: rider!._id }, { new: true })
            .populate({ path: DB_SCHEMA.RIDER.toLowerCase(), select: "fullName", options: { lean: true } })
            .populate({ path: DB_SCHEMA.CUSTOMER.toLowerCase(), select: "fullName", options: { lean: true } })
            .populate({ path: DB_SCHEMA.VENDOR.toLowerCase(), select: "businessName businessLogo", options: { lean: true } })
            .lean();
        return updatedOrder;
    },

    async updateStatus(
        orderId: IOrdersDocument["_id"],
        status: ORDER_STATUS
    ): Promise<IOrdersDocument | null> {
        const ordersRepo = new OrdersRepository()
        const order = await ordersRepo.updateStatus({ orderId, status });
        return order
    }
}

export interface GetOrdersFilter {
    searchQuery: string;
    fromDate?: string;
    toDate?: string;
    sort: 'asc' | 'desc';
}
