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
          let currentFilter = {};
          let previousFilter = {};
          
          if (startDate && endDate) {
            const currentStart = new Date(startDate);
            const currentEnd = new Date(endDate);
    
            const previousStart = new Date(
              currentStart.getTime() - (currentEnd.getTime() - currentStart.getTime())
            );
            const previousEnd = new Date(currentStart);
    
            currentFilter = {
              createdAt: {
                $gte: currentStart,
                $lte: currentEnd
              }
            };
    
            previousFilter = {
              createdAt: {
                $gte: previousStart,
                $lte: previousEnd
              }
            };
          }
    
          const [
            currentCustomerCount,
            currentOrderCount,
            currentRiderCount,
            currentVendorCount,
            prevCustomerCount,
            prevOrderCount,
            prevRiderCount,
            prevVendorCount
          ] = await Promise.all([
            Customer.countDocuments(currentFilter),
            Order.countDocuments(currentFilter),
            Rider.countDocuments(currentFilter),
            Vendor.countDocuments(currentFilter),
            Customer.countDocuments(previousFilter),
            Order.countDocuments(previousFilter),
            Rider.countDocuments(previousFilter),
            Vendor.countDocuments(previousFilter)
          ]);
    
          function calculateGrowth(current: number, previous: number): number {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
          }
    
          return {
            customers: currentCustomerCount,
            orders: currentOrderCount,
            riders: currentRiderCount,
            vendors: currentVendorCount,
            growth: {
              customers: calculateGrowth(currentCustomerCount, prevCustomerCount),
              orders: calculateGrowth(currentOrderCount, prevOrderCount),
              riders: calculateGrowth(currentRiderCount, prevRiderCount),
              vendors: calculateGrowth(currentVendorCount, prevVendorCount)
            },
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
                    $sum: { $cond: [{ $eq: ["$accountStatus", "active"] }, 1, 0] }
                    },
                    inactive: {
                    $sum: { $cond: [{ $ne: ["$accountStatus", "active"] }, 1, 0] }
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

