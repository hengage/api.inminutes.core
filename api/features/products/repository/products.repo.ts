import { HandleException, STATUS_CODES } from "../../../utils";
import { Product, ProductCategory, WishList } from "../models/products.models";

class ProductsRepository {
  async addProduct(payload: any, vendor: string) {
    const { name, image, description, quantity, cost, tags, addOns, category } =
      payload;
    const product = await Product.create({
      name,
      image,
      description,
      quantity,
      cost,
      category,
      vendor,
      tags,
      addOns,
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

  async getCategories() {
    const categories = await ProductCategory.find()
      .select("_id name")
      .lean()
      .exec();
    return categories;
  }

  async decreaseproductQuantity(productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Product not found");
    }
    product.quantity -= quantity;
    await product.save();
  }

  async productDetails(productId: string) {
    const product = await Product.findById(productId)
      .select("-__v -updatedAt -createdAt -status")
      .populate({ path: "category", select: "name" })
      .populate({
        path: "vendor",
        select: "businessName location.coordinates",
      });

    return product;
  }

  async deleteProduct(productId: string, vendorId: string) {
    const result = await Product.deleteOne({
      _id: productId,
      vendor: vendorId,
    });

    if (result.deletedCount === 0) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Product not found");
    }

    console.log(" Deleted product", productId);
  }

  async searchProducts(params: { term: string; page: number }) {
    const query = { name: { $regex: params.term, $options: "i" } };

    const options = {
      page: params.page || 1,
      limit: 20,
      select: "name cost image",
      populate: [{ path: "vendor", select: "businessName" }],
      lean: true,
      leanWithId: false,
    };

    const products = await Product.paginate(query, options);
    return products;
  }

  async getProductsByCategory(params: { categoryId: string; page: number }) {
    const query = { category: params.categoryId };

    const options = {
      page: params.page || 1,
      limit: 20,
      select: "name cost image",
      populate: [
        { path: "vendor", select: "businessName location.coordinates" },
      ],
      lean: true,
      leanWithId: false,
    };

    const products = await Product.paginate(query, options);
    return products;
  }

  async addToWishList(params: { customerId: string; productId: string }) {
    const { customerId, productId } = params;
    const wishList = await WishList.findOneAndUpdate(
      { customer: customerId },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    );

    return wishList;
  }

  async removeFromWishList(params: { customerId: string; productId: string }) {
    const { customerId, productId } = params;
    const wishList = await WishList.findOneAndUpdate(
      { customer: customerId },
      { $pull: { products: productId } },
      { new: true }
    );

    return wishList;
  }

  async getWishListForCustomer(customerId: string) {
    const wishList = await WishList.findOne({ customer: customerId }).populate({
      path: "products",
      select: "_id name image",
    });
    return wishList;
  }

  async checkProductIsInCustomerWishList(params: {
    customerId: string;
    productId: string;
  }) {
    const { customerId, productId } = params;
    const isInWishList = await WishList.exists({
      customer: customerId,
      products: productId,
    });

    return isInWishList;
  }
}

export const productsRepo = new ProductsRepository();
