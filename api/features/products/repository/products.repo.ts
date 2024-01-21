import { HandleException, STATUS_CODES } from "../../../utils";
import { Product } from "../models/products.models";

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

  async decreaseproductQuantity(productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new HandleException(STATUS_CODES.NOT_FOUND, "Product not found");
    }
    product.quantity -= quantity;
    await product.save();
  }
}

export const productsRepo = new ProductsRepository();
