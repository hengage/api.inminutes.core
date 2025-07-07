import { ORDER_STATUS, USER_APPROVAL_STATUS } from "../../../constants";
import { Errand } from "../../errand";
import { Order } from "../../orders";
import { Rider } from "../../riders";
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

  async getRidersSummary() {
    const [
      totalRiders,
      totalPendingRiders,
      totalOrdersForRiders,
      totalErrandsForRiders,
    ] = await Promise.all([
      Rider.countDocuments({
        isDeleted: false,
        approvalStatus: USER_APPROVAL_STATUS.APPROVED,
      }),
      Rider.countDocuments({ approvalStatus: USER_APPROVAL_STATUS.PENDING }),
      Order.countDocuments({ rider: { $exists: true } }),
      Errand.countDocuments({ rider: { $exists: true } }),
    ]);

    return {
      totalRiders,
      totalPendingRiders,
      totalOrdersForRiders,
      totalErrandsForRiders,
    };
  },

  async getTopRiders() {
    const orderDeliveries = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.DELIVERED,
          rider: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$rider",
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const errandDeliveries = await Errand.aggregate([
      {
        $match: {
          status: ORDER_STATUS.DELIVERED,
          rider: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$rider",
          errandCount: { $sum: 1 },
        },
      },
    ]);

    const deliveryMap = new Map<string, number>();

    for (const order of orderDeliveries) {
      deliveryMap.set(order._id, order.orderCount);
    }

    for (const errand of errandDeliveries) {
      const current = deliveryMap.get(errand._id) || 0;
      deliveryMap.set(errand._id, current + errand.errandCount);
    }

    const topRiderIds = [...deliveryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([riderId]) => riderId);

    const riders = await Rider.find(
      { _id: { $in: topRiderIds } },
      { _id: 1, fullName: 1 }
    ).lean();

    return topRiderIds.reduce(
      (acc, id) => {
        const rider = riders.find((r) => r._id === id);
        if (rider && rider._id) {
          acc.push({
            riderId: rider._id,
            fullName: rider.fullName,
          });
        }
        return acc;
      },
      [] as { riderId: string; fullName: string }[]
    );
  },
};
