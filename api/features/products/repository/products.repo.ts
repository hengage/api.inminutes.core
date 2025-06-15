import { HTTP_STATUS_CODES } from "../../../constants";
import { createPaginationOptions, HandleException, Msg } from "../../../utils";
import { Product, ProductCategory, WishList } from "../models/products.models";
import { IAddProductData } from "../products.interface";

/**
 * Repository for product-related operations.
 * @class
 */
export class ProductsRepository {
  private productModel = Product;
  private productCategoryModel = ProductCategory;
  private wishListModel = WishList;

  constructor() {}

  /**
  @async
  Creates a new product.
  @param {object} addProductData - The product data.
  @param {string} vendor - The ID of the vendor creating the product.
  */
  async addProduct(addProductData: IAddProductData, vendor: string) {
    const product = await this.productModel.create({
      vendor,
      ...addProductData,
    });

    return {
      _id: product._id,
      name: product.name,
      image: product.image,
      description: product.description,
      quantity: product.quantity,
      cost: product.cost,
      addOns: product.addOns,
    };
  }

  /**
   * @async
  Retrieves all product categories.
  @returns {object[]} The product categories.
  */
  async getCategories() {
    const categories = await this.productCategoryModel
      .find()
      .select("_id name")
      .lean()
      .exec();
    return categories;
  }

  /**
   @async
  Decreases the quantity of a product.
  @param {string} productId - The product ID.
  @param {number} quantity - The quantity to decrease.
  */
  async decreaseproductQuantity(productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND("product", productId)
      );
    }
    product.quantity -= quantity;
    await product.save();
  }

  /**
   @async
  Retrieves product details.
  @param {string} productId - The product ID.
  */
  async details(productId: string) {
    const product = await this.productModel
      .findById(productId)
      .select("-__v -updatedAt -createdAt -status")
      .populate({ path: "category", select: "name" })
      .populate({
        path: "vendor",
        select: "businessName location.coordinates",
      })
      .lean();

    return product;
  }

  /**
   * @async
  Deletes a product from database.
  @param {string} productId - The product ID.
  @param {string} vendorId - The  ID of the vendor who owns the product.
  */
  async deleteProduct(productId: string, vendorId: string) {
    const result = await this.productModel.deleteOne({
      _id: productId,
      vendor: vendorId,
    });

    if (result.deletedCount === 0) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND("product", productId)
      );
    }

    console.log(" Deleted product", productId);
  }

  /**
  * @async
  * Searches for products based on a search term.
  @param {string} params.term - The search term to match in product names.
  @param {number} params.page - The page number for pagination.
   * @returns 
   */
  async searchProducts(params: { term: string; page: number }) {
    const query = { name: { $regex: params.term, $options: "i" } };

    const options = createPaginationOptions(
      {
        select: "name cost image",
        populate: [{ path: "vendor", select: "businessName" }],
      },
      isNaN(params.page) ? undefined : params.page
    );

    const products = await this.productModel.paginate(query, options);
    return products;
  }

  /**
  Retrieves products belonging to a specific category.
  @param {string} params.categoryId - The ID of the category to fetch products from.
@param {number} params.page - The page number for pagination.
  */
  async getProductsByCategory(params: { categoryId: string; page: number }) {
    const query = { category: params.categoryId };

    const options = createPaginationOptions(
      {
        select: "name cost image",
        populate: [
          { path: "vendor", select: "businessName location.coordinates" },
        ],
      },
      isNaN(params.page) ? undefined : params.page
    );

    const products = await Product.paginate(query, options);
    return products;
  }

  /**
   * @async
  Adds a product to a customer's wish list.
  @param {object} params - The customer and product IDs.
  */
  async addToWishList(params: { customerId: string; productId: string }) {
    const { customerId, productId } = params;
    const wishList = await WishList.findOneAndUpdate(
      { customer: customerId },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    );

    return wishList;
  }

  /**
  @async
  Removes a product from a customer's wish list.
  @param {object} params - The customer and product IDs.
  */
  async removeFromWishList(params: { customerId: string; productId: string }) {
    const { customerId, productId } = params;
    const wishList = await WishList.findOneAndUpdate(
      { customer: customerId },
      { $pull: { products: productId } },
      { new: true }
    );

    return wishList;
  }

  /**
   *@async
  Retrieves the products in a customer's wish list.
  @param {string} customerId - The customer ID.
  */
  async getWishListForCustomer(customerId: string) {
    const wishList = await this.wishListModel
      .findOne({ customer: customerId })
      .populate({
        path: "products",
        select: "_id name image",
      });
    return wishList;
  }

  /**
  Checks if a product is in a customer's wish list.
  @param {object} params - The customer and product IDs.
  @returns {boolean} Whether the product is in the wish list.
  */
  async checkProductIsInCustomerWishList(params: {
    customerId: string;
    productId: string;
  }) {
    const { customerId, productId } = params;
    const isInWishList = await this.wishListModel.exists({
      customer: customerId,
      products: productId,
    });

    return isInWishList;
  }
}
