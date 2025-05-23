import { DB_SCHEMA, HTTP_STATUS_CODES } from "../../../constants";
import { capitalize, HandleException } from "../../../utils";
import { VendorCategory, VendorSubCategory } from "../../vendors";
import {
  IVendorCategoryDocument,
  IVendorSubCategoryDocument,
} from "../../vendors/vendors.interface";

export class AdminOpsVendorsCategoryService {
  private vendorCategoryModel = VendorCategory;
  private vendorSubCategoryModel = VendorSubCategory;

  async createCategory(payload: {
    name: string;
    image: string;
  }): Promise<IVendorCategoryDocument> {
    const categoryExists = await this.vendorCategoryModel
      .findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (categoryExists) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        `${capitalize(payload.name)} is an existing vendor category`,
      );
    }

    const category = await this.vendorCategoryModel.create({
      name: payload.name,
      image: payload.image,
    });

    return {
      _id: category._id,
      name: category.name,
      image: category.image,
    };
  }

  async createSubCategory(payload: {
    name: string;
    category: string;
  }): Promise<Omit<IVendorSubCategoryDocument, "category">> {
    const subCategoryExists = await this.vendorSubCategoryModel
      .findOne({ name: payload.name, category: payload.category })
      .select("name")
      .lean()
      .exec();

    if (subCategoryExists) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        `${capitalize(payload.name)} is an existing sub-category for this category`,
      );
    }

    const subCategory = await this.vendorSubCategoryModel.create({
      name: payload.name,
      category: payload.category,
    });

    return {
      _id: subCategory._id,
      name: subCategory.name,
    };
  }

  async getSubCategories(category: string): Promise<IVendorSubCategoryDocument[]> {
    const subCategories = await this.vendorSubCategoryModel
      .find({ category})
      .select("name category")
      .lean()
      .exec();

    return subCategories;
  }

  async getCategories(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    categories: IVendorCategoryDocument[];
    total: number;
    page: number;
    pages: number;
  }> {
    const result = await VendorCategory.aggregate([
      {
        $lookup: {
          from: DB_SCHEMA.VENDOR_SUB_CATEGORY,
          localField: "_id",
          foreignField: "category",
          as: "subcategories",
        },
      },
      {
        $lookup: {
          from: DB_SCHEMA.VENDOR,
          localField: "_id",
          foreignField: "category",
          as: "vendors",
        },
      },
      {
        $facet: {
          categories: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
                subcategoryCount: { $size: "$subcategories" },
                vendorCount: { $size: "$vendors" },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
      {
        $project: {
          categories: 1,
          total: { $arrayElemAt: ["$total.count", 0] },
          page: { $literal: page },
          pages: {
            $ceil: {
              $divide: [{ $arrayElemAt: ["$total.count", 0] }, limit],
            },
          },
        },
      },
    ]).exec();
  
    return {
      categories: result[0].categories,
      total: result[0].total || 0,
      page,
      pages: result[0].pages || 1,
    };
  }

  async getCategory(categoryId: string): Promise<IVendorCategoryDocument> {
    const category = await this.vendorCategoryModel
      .findById(categoryId)
      .select("name image")
      .lean()
      .exec();

    if (!category) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        "Category not found",
      );
    }
    return category;
  }

  async updateCategory(
    categoryId: string,
    updateCategoryData: IUpdateCategory,
  ): Promise<IVendorCategoryDocument> {
    const category = await this.vendorCategoryModel
      .findByIdAndUpdate(
        categoryId,
        { $set: updateCategoryData },
        { new: true },
      )
      .select("name image")
      .lean()
      .exec();

    if (!category) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        "Category not found",
      );
    }
    return category;
  }

  async deleteCategory(categoryId: string): Promise<IVendorCategoryDocument> {
    const category = await this.vendorCategoryModel
      .findByIdAndDelete(categoryId)
      .select("name image")
      .lean()
      .exec();

    if (!category) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        "Category not found",
      );
    }
    return category;
  }
}

interface IUpdateCategory {
  name?: IVendorCategoryDocument["_id"];
  image?: IVendorCategoryDocument["image"];
}

export interface ICreateCategory {
  name: string;
  image: string;
}

export interface ICreateSubCategory {
  name: string;
  category: string;
}
