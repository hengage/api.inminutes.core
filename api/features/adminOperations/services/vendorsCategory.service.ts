import { VendorCategory, VendorSubCategory } from "../../vendors";

class AdminOpsVendorsCategoryService {
  async createCategory(payload: any) {
    const category = await VendorCategory.create({
      name: payload.name,
      image: payload.image,
    });

    return {
        _id: category._id,
        name: category.name,
        image: category.image
    };
  }

  async createSubCategory(payload: any) {
    const subCategory = await VendorSubCategory.create({
      name: payload.name,
      category: payload.category,
    });

    return {
        _id: subCategory._id,
        name: subCategory.name
    };
  }
}

export const adminOpsVendorsCategoryService =
  new AdminOpsVendorsCategoryService();
