import { PaginateResult } from "mongoose";
import { Customer, ICustomerDocument } from "../../customers";
import { FilterQuery } from "mongoose";
import {
  addDateRangeFilter,
  buildFilterQuery,
  createPaginationOptions,
  HandleException,
  Msg,
} from "../../../utils";
import {
  ACCOUNT_STATUS,
  DB_SCHEMA,
  HTTP_STATUS_CODES,
  ORDER_STATUS,
} from "../../../constants";
import { Order } from "../../orders";
import {
  CustomerMetricsRange,
  CustomerMetricsResponse,
  CustomerSummaryResponse,
  GetCustomersFilter,
  ICustomerDetailsWithStats,
} from "../interfaces/customer.interface";
import { Errand } from "../../errand";

export const AdminOpsForCustomersService = {
  async getList(
    page = 1,
    filter: GetCustomersFilter
  ): Promise<PaginateResult<ICustomerDocument>> {
    const options = createPaginationOptions(
      { select: "_id fullName email phoneNumber" },
      page
    );

    const filterQuery: FilterQuery<ICustomerDocument> = {};
    if (filter) {
      const {
        fromDateJoined: fromDate,
        toDateJoined: toDate,
        ...otherFilters
      } = filter;

      // Handle date range
      addDateRangeFilter(filterQuery, fromDate, toDate);

      // Handle other filters
      const recordFilter: Record<string, string> = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(otherFilters).filter(([_, v]) => v !== undefined)
      );

      const searchFields = ["fullname", "email", "phoneNumber"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
    }

    const transactions = await Customer.paginate(filterQuery, options);
    return transactions;
  },

  async customerDetails(
    customerId: string
  ): Promise<ICustomerDetailsWithStats> {
    const [totalOrders, totalErrands, customer] = await Promise.all([
      Order.countDocuments({ customer: customerId }),
      Errand.countDocuments({ customer: customerId }),
      Customer.findById(customerId)
        .select("-__v -password -deliveryAddressCoords")
        .lean()
        .exec(),
    ]);

    if (!customer) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND("customer", customerId)
      );
    }
    return {
      ...customer,
      totalOrders,
      totalErrands,
    };
  },

  /**
   * Updates customer account status
   * @param customerId - The vendor's ID
   * @param status - New account status
   */
  async setAccountStatus(
    customerId: ICustomerDocument["_id"],
    status: ACCOUNT_STATUS
  ): Promise<void> {
    const customer =
      await Customer.findById(customerId).select("_id accountStatus");
    if (!customer) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND("customer", customerId)
      );
    }
    customer.accountStatus = status;
    await customer.save();
  },

  async getTopList(
    page = 1,
    filter: GetCustomersFilter,
    limit = 5
  ): Promise<PaginateResult<ICustomerDocument>> {
    const options = createPaginationOptions(
      { select: "_id fullName email phoneNumber" },
      limit,
      page
    );

    const filterQuery: FilterQuery<ICustomerDocument> = {};
    if (filter) {
      const {
        fromDateJoined: fromDate,
        toDateJoined: toDate,
        ...otherFilters
      } = filter;

      addDateRangeFilter(filterQuery, fromDate, toDate);

      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(otherFilters).filter(([, v]) => v !== undefined)
      );

      const searchFields = ["fullName", "email", "phoneNumber"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
    }

    const topCustomers = await Order.aggregate([
      {
        $match: { status: ORDER_STATUS.DELIVERED },
      },
      {
        $group: {
          _id: "$customer",
          totalDeliveries: { $sum: 1 },
        },
      },
      { $sort: { totalDeliveries: -1 } },
      {
        $lookup: {
          from: DB_SCHEMA.CUSTOMER,
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $project: {
          _id: "$customerDetails._id",
          fullName: "$customerDetails.fullName",
          email: "$customerDetails.email",
          phoneNumber: "$customerDetails.phoneNumber",
          totalDeliveries: 1,
        },
      },
    ]);

    const customerIds = topCustomers.map((customer) => customer._id);
    const totalDeliveriesMap = new Map(
      topCustomers.map((c) => [c._id.toString(), c.totalDeliveries])
    );

    const paginatedCustomers: PaginateResult<ICustomerDocument> =
      await Customer.paginate(
        { _id: { $in: customerIds }, ...filterQuery },
        options
      );

    paginatedCustomers.docs = paginatedCustomers.docs.map((customer) => {
      customer.toObject();
      return Object.assign(customer, {
        totalDeliveries: totalDeliveriesMap.get(customer._id.toString()) || 0,
      });
    });

    return paginatedCustomers;
  },

  async getCustomerSummary(): Promise<CustomerSummaryResponse> {
    const totalCustomers = await Customer.countDocuments({});

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const returningCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$customer",
          orderCount: { $sum: 1 },
        },
      },
      {
        $match: {
          orderCount: { $gt: 1 },
        },
      },
      {
        $count: "returningCustomers",
      },
    ]);

    return {
      totalCustomers,
      newCustomers,
      returningCustomers: returningCustomers[0]?.returningCustomers || 0,
    };
  },

  async getCustomerMetrics(
    data: CustomerMetricsRange
  ): Promise<CustomerMetricsResponse[]> {
    const customerMetrics = await Customer.aggregate([
      {
        $match: {
          createdAt: {
            $gte: data.startDate,
            $lte: data.endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalCustomers: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: "%Y-%m",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                },
              },
            },
          },
          totalCustomers: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    return customerMetrics;
  },
};
