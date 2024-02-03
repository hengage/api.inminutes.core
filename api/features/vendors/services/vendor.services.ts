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

  
  async getProductsAndGroupByCategory(vendorId: string) {
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
                $expr: { $eq: ["$_id", "$$categoryId"] }
              }
            },
            {
              $project: {
                name: 1,
                _id: 1
              }
            }
          ],
          as: "categoryInfo",
        },
      },
      // {
      //   $unwind: "$categoryInfo",
      // },
      {
        $project: {
          _id: 1,
          categoryGroup: 1,
          category: "$categoryInfo",
        },
      },
    ];

    const products = await Product.aggregate(pipeline);
    return products;
  }
}

export const vendorsService = new VendorsService();
