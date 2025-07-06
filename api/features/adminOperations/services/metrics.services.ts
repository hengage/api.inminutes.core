import { ORDER_STATUS, USER_APPROVAL_STATUS } from "../../../constants";
import { Order } from "../../orders";
import { Vendor, VendorCategory, VendorSubCategory } from "../../vendors";

export const AdminOpsMetricsService = {
  async getVendorsSummary() {
    const [
      vendorsCount,
      pendingVendorsCount,
      categoriesCount,
      subCategoriesCount,
    ] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({
        approvalStatus: USER_APPROVAL_STATUS.PENDING,
      }),
      VendorCategory.countDocuments(),
      VendorSubCategory.countDocuments(),
    ]);

    return {
      vendorsCount,
      pendingVendorsCount,
      categoriesCount,
      subCategoriesCount,
    };
  },

  async getMaxSales() {
    const maxSalesResult = await Order.aggregate([
      {
        $match: {
          //   createdAt: { $gte: fromDate, $lte: toDate },
          status: ORDER_STATUS.DELIVERED,
        },
      },
      {
        $group: {
          _id: "$vendor",
          totalSales: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 1 },
    ]);

    return maxSalesResult[0]?.totalSales || 1;
  },

  async getTopVendors() {
    const maxSales = await this.getMaxSales();
    console.log("Max Sales:", maxSales);
    const topVendors = await Order.aggregate([
      // Step 1: Sales count per vendor
      {
        $match: {
          //   createdAt: { $gte: fromDate, $lte: toDate },
          status: ORDER_STATUS.DELIVERED,
        },
      },
      {
        $group: {
          _id: "$vendor",
          totalSales: { $sum: 1 },
        },
      },
      // Step 2: Join Vendor info (and ratings)
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      // Step 3: Compute normalized scores
      {
        $addFields: {
          normalizedSales: { $divide: ["$totalSales", maxSales] },
          normalizedRating: {
            $divide: [{ $ifNull: ["$vendor.rating.averageRating", 0] }, 5],
          },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$normalizedSales", 0.6] },
              { $multiply: ["$normalizedRating", 0.4] },
            ],
          },
        },
      },
      // Step 4: Sort and pick top 5
      { $sort: { score: -1 } },
      { $limit: 5 },
      // Optional: shape output
      {
        $project: {
          _id: 0,
          vendorId: "$vendor._id",
          businessName: "$vendor.businessName",
          businessLogo: "$vendor.businessLogo",
          totalSales: 1,
          averageRating: "$vendor.rating.averageRating",
          score: 1,
        },
      },
    ]);

    return topVendors;
  },

  async getTopVendorCategories() {
    const topCategories = await Vendor.aggregate([
      {
        $match: {
          isDeleted: false,
          approvalStatus: USER_APPROVAL_STATUS.APPROVED,
        },
      },
      {
        $group: {
          _id: "$category",
          vendorCount: { $sum: 1 },
        },
      },
      {
        $project: {
          categoryId: "$_id",
          vendorCount: 1,
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "vendorcategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          categoryId: 1,
          categoryName: "$category.name",
          vendorCount: 1,
        },
      },
      { $sort: { vendorCount: -1 } },
      { $limit: 5 },
    ]);

    return topCategories;
  },
};
