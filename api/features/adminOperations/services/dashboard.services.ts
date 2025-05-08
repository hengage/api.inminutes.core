import { Customer } from "../../customers"
import {HandleException, Msg } from "../../../utils";
import { Order } from "../../orders";
import { Rider } from "../../riders";
import { Vendor } from "../../vendors";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears } from "date-fns";
import { HTTP_STATUS_CODES } from "../../../constants";

export type Timeframe =
  | "today"
  | "yesterday"
  | "lastWeek"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "custom";

export const AdminOpsForDashboardService = {

    async getStats(startDate?: string, endDate?: string): Promise<any> {
        try {
          const dateFilter = startDate && endDate ? {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          } : {};
    
          const [customerCount, orderCount, riderCount, vendorCount] = await Promise.all([
            Customer.countDocuments(dateFilter),
            Order.countDocuments(dateFilter),
            Rider.countDocuments(dateFilter),
            Vendor.countDocuments(dateFilter)
          ]);
    
          return {
            customers: customerCount,
            orders: orderCount,
            riders: riderCount,
            vendors: vendorCount,
            message: "Dashboard stats retrieved"
          };
        } catch (error: any) {
            throw new HandleException(
                HTTP_STATUS_CODES.BAD_REQUEST,
                error.message
            );
        }
      },

      async graphData(service: "customers" | "riders" | "vendors", timeframe?: Timeframe, startDate?: string, endDate?: string) {
        try {
          let Model;
          switch (service) {
            case "customers":
              Model = Customer;
              break;
            case "riders":
              Model = Rider;
              break;
            case "vendors":
              Model = Vendor;
              break;
            default:
              throw new Error("Invalid service type");
          }
    
          // Time range filter
          let matchFilter: any = {};
          let groupFormat: string;
    
          const now = new Date();
    
          switch (timeframe) {
            case "today":
              matchFilter.createdAt = {
                $gte: startOfDay(now),
                $lte: endOfDay(now)
              };
              groupFormat = "%H:00"; // Hourly
              break;
    
            case "yesterday":
              const yesterday = subDays(now, 1);
              matchFilter.createdAt = {
                $gte: startOfDay(yesterday),
                $lte: endOfDay(yesterday)
              };
              groupFormat = "%H:00"; // Hourly
              break;
    
            case "lastWeek":
              matchFilter.createdAt = {
                $gte: startOfWeek(now, { weekStartsOn: 1 }),
                $lte: endOfWeek(now, { weekStartsOn: 1 })
              };
              groupFormat = "%Y-%m-%d"; // Daily
              break;
    
            case "lastMonth":
              matchFilter.createdAt = {
                $gte: startOfMonth(subMonths(now, 1)),
                $lte: endOfMonth(subMonths(now, 1))
              };
              groupFormat = "%Y-%m-%d"; // Daily
              break;
    
            case "thisYear":
              matchFilter.createdAt = {
                $gte: startOfYear(now),
                $lte: endOfYear(now)
              };
              groupFormat = "%Y-%m"; // Monthly
              break;
    
            case "lastYear":
              matchFilter.createdAt = {
                $gte: startOfYear(subYears(now, 1)),
                $lte: endOfYear(subYears(now, 1))
              };
              groupFormat = "%Y-%m"; // Monthly
              break;
    
            case "custom":
              if (!startDate || !endDate) {
                throw new Error("Start and End date required for custom range");
              }
              matchFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              };
              groupFormat = "%Y-%m-%d"; // Daily default
              break;
    
            default:
              throw new Error("Invalid timeframe");
          }
    
          const result = await Model.aggregate([
            { $match: matchFilter },
            {
              $project: {
                isActive: 1,
                createdAt: 1,
                group: { $dateToString: { format: groupFormat, date: "$createdAt" } }
              }
            },
            {
              $group: {
                _id: "$group",
                active: {
                  $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
                },
                inactive: {
                  $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
                }
              }
            },
            { $sort: { _id: 1 } }
          ]);
    
          return {
            service,
            timeframe,
            series: result
          };
        } catch (error: any) {
          throw new HandleException(
                          HTTP_STATUS_CODES.BAD_REQUEST,
                          error.message
                      );
        }
      }


}

