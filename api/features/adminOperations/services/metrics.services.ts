import {
  ACCOUNT_STATUS,
  ErrandStatus,
  ORDER_STATUS,
  PRODUCT_STATUS,
  USER_APPROVAL_STATUS,
} from "../../../constants";
import { Customer } from "../../customers";
import { Errand } from "../../errand";
import { Order } from "../../orders";
import { Product, ProductCategory, ProductSubCategory } from "../../products";
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
    const topRiders = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.DELIVERED,
          rider: { $nin: [null, ""] },
        },
      },
      {
        $project: {
          rider: 1,
          deliveryType: { $literal: "order" },
        },
      },
      {
        $unionWith: {
          coll: "errands",
          pipeline: [
            {
              $match: {
                status: ORDER_STATUS.DELIVERED,
                rider: { $nin: [null, ""] },
              },
            },
            {
              $project: {
                rider: 1,
                deliveryType: { $literal: "errand" },
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$rider",
          totalDeliveries: { $sum: 1 },
        },
      },
      {
        $sort: { totalDeliveries: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "riders",
          localField: "_id",
          foreignField: "_id",
          as: "riderInfo",
        },
      },
      {
        $project: {
          fullName: { $arrayElemAt: ["$riderInfo.fullName", 0] },
          totalDeliveries: 1,
        },
      },
    ]);

    return topRiders;
  },

  async getProductsSummary() {
    const [totalProducts, categories, subCategories, productApplicants] =
      await Promise.all([
        Product.countDocuments({ isDeleted: false }),
        ProductCategory.countDocuments(),
        ProductSubCategory.countDocuments(),
        Product.countDocuments({ status: PRODUCT_STATUS.PENDING }),
      ]);

    return {
      totalProducts,
      productApplicants,
      categories,
      subCategories,
    };
  },

  async getTopProducts() {
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.DELIVERED,
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
          orderCount: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$items.quantity",
                {
                  $toDouble: "$items.cost",
                },
              ],
            },
          },
        },
      },
      {
        $addFields: {
          hybridScore: {
            $add: [
              { $multiply: ["$totalQuantitySold", 1] }, // Quantity weight: 1x
              { $multiply: ["$orderCount", 2] }, // Popularity weight: 2x
              { $multiply: ["$totalRevenue", 0.01] }, // Revenue weight: 0.01x
            ],
          },
        },
      },
      {
        $limit: 5,
      },
      {
        $group: {
          _id: null,
          products: { $push: "$$ROOT" },
          totalOrders: { $sum: "$orderCount" },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $addFields: {
          "products.popularityPercentage": {
            $round: [
              {
                $multiply: [
                  { $divide: ["$products.orderCount", "$totalOrders"] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $replaceRoot: { newRoot: "$products" },
      },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $match: {
          "productInfo.0": { $exists: true },
        },
      },
      {
        $sort: { popularityPercentage: -1 },
      },
      {
        $project: {
          productName: { $arrayElemAt: ["$productInfo.name", 0] },
          totalQuantitySold: 1,
          orderCount: 1,
          totalRevenue: 1,
          hybridScore: 1,
          popularityPercentage: 1,
        },
      },
    ]);

    return topProducts;
  },

  async getTopProductCategories() {
    const topCategories = await Product.aggregate([
      {
        $match: {
          isDeleted: false, // Only active products
        },
      },
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
        },
      },
      {
        $sort: { productCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $project: {
          categoryId: "$_id",
          categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
          productCount: 1,
        },
      },
    ]);

    return topCategories;
  },

  async getCustomersSummary() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const _90DaysAgo = new Date();
    _90DaysAgo.setDate(_90DaysAgo.getDate() - 90);

    // Run all operations concurrently
    const [totalCustomers, newCustomers, returningCustomersResult] =
      await Promise.all([
        Customer.countDocuments({
          accountStatus: ACCOUNT_STATUS.ACTIVE,
        }),

        // New Customers (created in last 30 days)
        Customer.countDocuments({
          accountStatus: ACCOUNT_STATUS.ACTIVE,
          createdAt: { $gte: thirtyDaysAgo },
        }),

        // Returning Customers (2+ orders in last 30 days)
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: _90DaysAgo },
            },
          },
          {
            $group: {
              _id: "$customer",
              orderCount: { $sum: 1 },
            },
          },
          {
            $match: {
              orderCount: { $gt: 1 }, // More than 1 order in timeframe
            },
          },
          {
            $count: "returningCustomers",
          },
        ]),
      ]);

    const returningCustomers =
      returningCustomersResult[0]?.returningCustomers || 0;

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
    };
  },

  async getTopCustomers() {
    const topCustomers = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.DELIVERED,
          customer: { $nin: [null, ""] },
        },
      },
      {
        $project: {
          customer: 1,
          deliveryType: { $literal: "order" },
        },
      },
      {
        $unionWith: {
          coll: "errands",
          pipeline: [
            {
              $match: {
                status: ErrandStatus.DELIVERED,
                customer: { $nin: [null, ""] },
              },
            },
            {
              $project: {
                customer: 1,
                deliveryType: { $literal: "errand" },
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$customer",
          totalDeliveries: { $sum: 1 },
        },
      },
      {
        $sort: { totalDeliveries: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      {
        $project: {
          fullName: { $arrayElemAt: ["$customerInfo.fullName", 0] },
          totalDeliveries: 1,
        },
      },
    ]);

    return topCustomers;
  },
};
