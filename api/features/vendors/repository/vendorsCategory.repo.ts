import { PaginateModel } from "mongoose";
import { Vendor } from "../models/vendors.model";
import {
  VendorCategory,
  VendorSubCategory,
} from "../models/vendorsCategory.model";
import {
  IVendorCategoryDocument,
  IVendorSubCategoryDocument,
} from "../vendors.interface";

/**
    Repository for managing vendor categories.
    /
    class VendorsCategoryRepository {
    */
class VendorsCategoryRepository {
  /**
    @async
    Retrieves a list of all vendor categories.
    */
  // async getCategories(): Promise<IVendorCategoryDocument[]> {
  //   const catgories = await VendorCategory.find()
  //     .select("name image")
  //     .lean()
  //     .exec();

  //   return catgories;
  // }
  async getCategories(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    categories: IVendorCategoryDocument[];
    total: number;
    pages: number;
  }> {
    const options = {
      page,
      limit,
      select: "name image",
      lean: true,
    };
  
    const paginatedResult = await VendorCategory.paginate({}, options);
    
    // Get counts for subcategories and vendors for each category
    const categoriesWithCounts = await Promise.all(
      paginatedResult.docs.map(async (category: any) => {
        const subCategoryCount = await VendorSubCategory.countDocuments({
          category: category._id,
        });
        
        const vendorCount = await Vendor.countDocuments({
          category: category._id,
        });
  
        return {
          ...category,
          subCategoryCount,
          vendorCount,
        };
      })
    );
  
    return {
      categories: categoriesWithCounts,
      total: paginatedResult.totalDocs,
      pages: paginatedResult.totalPages,
    };
  }

  /**
   @async
    Retrieves a list of sub-categories for a given category.
    @param {string} categoryId - The ID of the category to retrieve sub-categories for.
 */
  async getSubCategoriesByCategory(
    categoryId: string,
  ): Promise<IVendorSubCategoryDocument[]> {
    const catgories = await VendorSubCategory.find({ category: categoryId })
      .select("name")
      .lean()
      .exec();

    return catgories;
  }

  /**
   * @async
    Retrieves a list of sub-categories for the "Local Market" category.
 */
  async getLocalMarketSubcategories() {
    const subCatgories = await VendorSubCategory.find({ category: "447c0000" })
      .select("name")
      .lean()
      .exec();

    return subCatgories;
  }
}

export const vendorsCategoryRepo = new VendorsCategoryRepository();
