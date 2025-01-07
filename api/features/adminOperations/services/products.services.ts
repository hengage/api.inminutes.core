import { FilterQuery } from "mongoose";
import { HTTP_STATUS_CODES, PRODUCT_STATUS, SORT_ORDER } from "../../../constants";
import { HandleException, Msg, addDateRangeFilter, buildFilterQuery, capitalize, createPaginationOptions } from "../../../utils";
import { Product, ProductCategory } from "../../products";
import { IProductCategoryDocument, IProductDocument } from "../../products/products.interface";
import { PaginateResult } from "mongoose";

export class AdminOpsForProductsService {
  private productCategoryModel = ProductCategory;
  private productModel = Product;

  constructor() { }

  async createCategory(payload: {
    name: string;
  }): Promise<Pick<IProductCategoryDocument, "_id" | "name">> {
    const categoryExists = await this.productCategoryModel
      .findOne({ name: payload.name })
      .select("name")
      .lean()
      .exec();

    if (categoryExists) {
      throw new HandleException(
        HTTP_STATUS_CODES.CONFLICT,
        `${capitalize(payload.name)} is an existing product category`,
      );
    }

    const category = await this.productCategoryModel.create({
      name: payload.name,
    });

    return {
      _id: category._id,
      name: category.name,
    };
  }

  async approveProduct(productId: string) {
    await this.productModel.findByIdAndUpdate(
      productId,
      {
        $set: { status: PRODUCT_STATUS.APPROVED },
      },
      { new: true },
    );
  }

  async rejectProduct(productId: string) {
    await Product.findByIdAndUpdate(
      productId,
      {
        $set: { status: PRODUCT_STATUS.REJECTED },
      },
      { new: true },
    );
  }

  async getList(page = 1, filter: GetProductsFilter): Promise<PaginateResult<IProductDocument>> {
    const options = createPaginationOptions(
      page,
      {
        select: "_id name description price stock status createdAt",
        sort: { createdAt: filter.sort === SORT_ORDER.ASC ? 1 : -1 }
      }
    );

    const filterQuery: FilterQuery<IProductDocument> = {};
    if (filter) {
      const { fromDate, toDate, ...otherFilters } = filter;

      // Handle date range 
      addDateRangeFilter(filterQuery, fromDate, toDate);

      // Handle other filters
      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(otherFilters)
          .filter(([key, v]) => v !== undefined && key !== 'sort' && key !== 'page'),
      );

      const searchFields = ["_id", "name"];
      buildFilterQuery(recordFilter, filterQuery, searchFields);
    }

    const products = await this.productModel.paginate(filterQuery, options);
    return products;
  }

  async getProductDetails(productId: IProductDocument['_id']): Promise<IProductDocument> {
    const product = await this.productModel.findById(productId)
      .select('-__v -updatedAt')
      .lean()
      .exec();

    if (!product) {
      throw new HandleException(
        HTTP_STATUS_CODES.NOT_FOUND,
        Msg.ERROR_NOT_FOUND("product", productId)
      );
    }
    return product;
  }

  async metrics(): Promise<{ approved: number; pending: number; rejected: number }> {
    const approved = await this.productModel.countDocuments({
      status: PRODUCT_STATUS.APPROVED,
    });

    const pending = await this.productModel.countDocuments({
      status: PRODUCT_STATUS.PENDING,
    });

    const rejected = await this.productModel.countDocuments({
      status: PRODUCT_STATUS.REJECTED,
    });

    return { approved, pending, rejected };
  }

  async pendingProducts(page = 1): Promise<PaginateResult<IProductDocument>> {
    const options = createPaginationOptions(
      page,
      { select: "_id name description price stock status createdAt", }
    );

    const query: FilterQuery<IProductDocument> = {
      status: PRODUCT_STATUS.PENDING,
    };

    const products = await this.productModel.paginate(query, options);
    return products;
  }

  async getCategories(): Promise<IProductCategoryDocument[]> {
    const categories = await ProductCategory.find().select('_id name').lean().exec();
    return categories;
  }
}

export interface GetProductsFilter {
  searchQuery?: string;
  fromDate?: string;
  toDate?: string;
  category?: string;
  vendor?: string;
  sort?: SORT_ORDER;
}
