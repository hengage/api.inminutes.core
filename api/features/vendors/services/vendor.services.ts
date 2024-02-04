import { HandleException, STATUS_CODES } from "../../../utils";
import { Product } from "../../products";
import { Vendor } from "../models/vendors.model";

class VendorsService {
  async checkBusinnessNameIstaken(businessName: string) {
    const vendor = await Vendor.findOne({ businessName })
      .select("businessName")
      .lean();

    if (vendor) {
      throw new HandleException(
        STATUS_CODES.CONFLICT,
        "Business name already taken. Contact admin if this is your business name"
      );
    }

    return;
  }

  async getProducts(vendorId: string, page: number) {
    const query = { vendor: vendorId };

    const options = {
      page,
      limit: 20,
      select: "name image cost",
      leanWithId: false,
      lean: true,
    };

    const products = await Product.paginate(query, options);
    return products;
  }

  async getProductsAndGroupByCategory(params: {
    vendorId: string;
    page: number;
    limit: number;
  }) {
    const { vendorId, page, limit } = params;

    const pipeline = [
      { $match: { vendor: vendorId } },
      {
        $group: {
          _id: "$category",
          categoryGroup: {
            $push: {
              _id: "$_id",
              name: "$name",
              image: "$image",
              category: "$category",
              cost: "$cost",
            },
          },
        },
      },
      {
        $lookup: {
          from: "productcategories",
          let: { categoryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$categoryId"] },
              },
            },
            {
              $project: {
                name: 1,
                _id: 1,
              },
            },
          ],
          as: "categoryInfo",
        },
      },
      {
        $unwind: "$categoryInfo",
      },
      {
        $project: {
          _id: 1,
          categoryGroup: 1,
          category: "$categoryInfo",
        },
      },
      {
        $unwind: "$categoryGroup",
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $group: {
          _id: "$_id",
          categoryGroup: { $push: "$categoryGroup" },
          category: { $first: "$category.name" },
        },
      },
    ];

    const totalCount = await Product.countDocuments({ vendor: vendorId });

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page * limit < totalCount;
    const hasPrevPage = page > 1;

    const products = await Product.aggregate(pipeline);
    return {
      docs: products,
      currentPage: page,
      limit,
      totalPages: totalPages,
      hasNextPage: hasNextPage,
      hasPrevPage: hasPrevPage,
    };
  }
}

export const vendorsService = new VendorsService();
