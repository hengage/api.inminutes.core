import { PaginateResult } from "mongoose";
import { Order, IOrdersDocument } from "../../orders";
import { FilterQuery } from "mongoose";
import {
  addDateRangeFilter,
  buildFilterQuery,
  createPaginationOptions,
  excludeObjectKeys,
  HandleException,
  Msg,
} from "../../../utils";
import {
  DB_SCHEMA,
  HTTP_STATUS_CODES,
  ORDER_STATUS,
  SORT_ORDER,
} from "../../../constants";
import { RidersRepository } from "../../riders";
import { OrdersRepository } from "../../orders/repository/orders.repo";
import { GetOrdersQueryParams } from "../interfaces/orders.interface";

export const AdminOpsForOrdersService = {
  async getList(
    filter: GetOrdersQueryParams
  ): Promise<PaginateResult<IOrdersDocument>> {
    const page = filter.page ? Number(filter.page) : 1;
    const limit = Number(filter.limit);

    const options = createPaginationOptions(
      page,
      {
        select:
          "_id  totalCost type status createdAt totalCost totalProductsCost deliveryFee, rider, customer",
        sort: { createdAt: filter.sort === SORT_ORDER.ASC ? 1 : -1 },
        populate: [
          { path: "customer", select: "fullName displayName email" },
          { path: "rider", select: "fullName displayName email" },
        ],
      },
      isNaN(limit) ? undefined : limit
    );

    const filterQuery: FilterQuery<IOrdersDocument> = {};
    if (filter) {
      const { fromDate, toDate, ...otherFilters } = filter;

      // Filter for only ongoing orders if requested
      if (filter.onlyOngoing) {
        filterQuery.status = {
          $nin: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
        };
      }

      // Handle date range
      addDateRangeFilter(filterQuery, fromDate, toDate);

      const queryFilters: Record<string, string | number | boolean> =
        excludeObjectKeys(otherFilters, [
          "sort",
          "page",
          "limit",
          "onlyOngoing",
        ]);

      const searchFields = ["_id"];
      buildFilterQuery(queryFilters, filterQuery, searchFields);
    }
    const orders = await Order.paginate(filterQuery, options);
    return orders;
  },

  async getDetails(orderId: IOrdersDocument["_id"]): Promise<IOrdersDocument> {
    const order = await Order.findById(orderId)
      .select("-__v -deliveryLocation")
      .populate({ path: DB_SCHEMA.RIDER.toLowerCase(), select: "fullName" })
      .populate({ path: DB_SCHEMA.CUSTOMER.toLowerCase(), select: "fullName" })
      .populate({
        path: DB_SCHEMA.VENDOR.toLowerCase(),
        select: "businessName businessLogo",
      })
      .lean()
      .exec();

    if (!order) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND(DB_SCHEMA.ORDER, orderId)
      );
    }
    return order;
  },

  async assignRider(
    orderId: IOrdersDocument["_id"],
    riderId: string
  ): Promise<IOrdersDocument | null> {
    const ridersRepo = new RidersRepository();

    const [order, rider] = await Promise.all([
      Order.findById(orderId)
        .select(DB_SCHEMA.RIDER.toLocaleLowerCase())
        .lean(),
      ridersRepo.findActiveRider(riderId, ["_id", "currentlyWorking"]),
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
        Msg.ERROR_RIDER_NOT_WORKING()
      );
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { rider: rider!._id },
      { new: true }
    )
      .populate({
        path: DB_SCHEMA.RIDER.toLowerCase(),
        select: "fullName",
        options: { lean: true },
      })
      .populate({
        path: DB_SCHEMA.CUSTOMER.toLowerCase(),
        select: "fullName",
        options: { lean: true },
      })
      .populate({
        path: DB_SCHEMA.VENDOR.toLowerCase(),
        select: "businessName businessLogo",
        options: { lean: true },
      })
      .lean();
    return updatedOrder;
  },

  async updateStatus(
    orderId: IOrdersDocument["_id"],
    status: ORDER_STATUS
  ): Promise<IOrdersDocument | null> {
    const ordersRepo = new OrdersRepository();
    const order = await ordersRepo.updateStatus({ orderId, status });
    return order;
  },
};
