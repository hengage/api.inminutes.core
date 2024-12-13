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
  async getCategories(): Promise<IVendorCategoryDocument[]> {
    const catgories = await VendorCategory.find()
      .select("name image")
      .lean()
      .exec();

    return catgories;
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
