import { ClientSession, FilterQuery } from "mongoose";
import { DB_SCHEMA, HTTP_STATUS_CODES, ORDER_STATUS, PRODUCT_STATUS, SORT_ORDER } from "../../../constants";
import { HandleException, Msg, addDateRangeFilter, buildFilterQuery, capitalize, createPaginationOptions } from "../../../utils";
import { Product, ProductCategory } from "../../products";
import { IProductCategoryDocument, IProductDocument } from "../../products/products.interface";
import { PaginateResult } from "mongoose";
import { Order } from "../../orders";
import { GetProductRangeFilter, GetProductsFilter, ProductSummaryResponse, GetCategoriesQuery } from "../interfaces/product.interface";
import { addPriceRangeFilter } from "../../../utils/db.utils";
import { PipelineStage } from 'mongoose';

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
    await this.productModel.findByIdAndUpdate(
      productId,
      {
        $set: { status: PRODUCT_STATUS.REJECTED },
      },
      { new: true },
    );
  }

  async getList(page = 1, limit = 10, filter: GetProductsFilter): Promise<PaginateResult<IProductDocument>> {
    const options = createPaginationOptions(
      page,
      {
        select: "_id image name description price stock status cost createdAt category vendor",
        sort: { createdAt: filter.sort === SORT_ORDER.ASC ? 1 : -1 },
        populate: [
          { path: "category", select: "name" },
          { path: "vendor", select: "businessName" }
        ]
      },
      limit
    );

    const filterQuery: FilterQuery<IProductDocument> = {};
    if (filter) {
      const { fromDate, toDate, minPrice, maxPrice, ...otherFilters } = filter;

      // Handle date range 
      addDateRangeFilter(filterQuery, fromDate, toDate);

      addPriceRangeFilter(filterQuery, minPrice, maxPrice);
      // Handle other filters
      const recordFilter: Record<string, string> = Object.fromEntries(
        Object.entries(otherFilters)
          .filter(([key, v]) => 
            v !== undefined && !['sort', 'page', 'limit'].includes(key)
          )
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
      .populate({
        path: 'category',
        select: 'name',
      })
      .populate({
        path: 'vendor',
        select: 'businessName',
      })
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

  async getCategories(query: GetCategoriesQuery): Promise<{
    data: { _id: string; name: string; totalProducts: number }[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { searchQuery, page, limit} = query;
  
    const matchStage = {
      name: { $regex: searchQuery, $options: 'i' },
    };
  
    const aggregatePipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: DB_SCHEMA.PRODUCT,
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$category', '$$categoryId'] },
                isDeleted: false,
              },
            },
          ],
          as: 'products',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalProducts: { $size: '$products' },
        },
      },
      { $sort: { name: 1 as 1 | -1 } },
      { $skip: ((page ?? 1) - 1) * (limit ?? 10) },
      { $limit: limit },
    ];
  
    const data = await ProductCategory.aggregate(aggregatePipeline);
  
    // For total count (without pagination)
    const total = await ProductCategory.countDocuments(matchStage);
  
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getTopList(
      page = 1,
      filter: GetProductsFilter,
      limit = 5
  ): Promise<PaginateResult<IProductDocument>> {
    const options = createPaginationOptions(
      page,
      {
        select: "_id name description price stock status createdAt",
        sort: { createdAt: filter.sort === SORT_ORDER.ASC ? 1 : -1 }
      },
      limit
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

      const topProducts = await Order.aggregate([
          {
              $match: { status: ORDER_STATUS.DELIVERED }
          },
          {
              $group: {
                  _id: "$product",
                  totalDeliveries: { $sum: 1 }
              }
          },
          { $sort: { totalDeliveries: -1 } },
          {
              $lookup: {
                  from: DB_SCHEMA.PRODUCT,
                  localField: "_id",
                  foreignField: "_id",
                  as: "productDetails"
              }
          },
          { $unwind: "$productDetails" },
          {
              $project: {
                  _id: "$productDetails._id",
                  name: "$productDetails.name",
                  description: "$productDetails.description",
                  price: "$productDetails.price",
                  status: "$productDetails.status",
                  totalDeliveries: 1
              }
          }
      ]);

      const productIds = topProducts.map((product: any) => product._id);
      const totalDeliveriesMap = new Map(topProducts.map(c => [c._id.toString(), c.totalDeliveries]));

      const paginatedProducts: PaginateResult<IProductDocument> = await this.productModel.paginate(
          { _id: { $in: productIds }, ...filterQuery },
          options
      );

      paginatedProducts.docs = paginatedProducts.docs.map((product: any) => {
        const productObj = product.toObject();
        return {
            ...productObj,
            totalDeliveries: totalDeliveriesMap.get(product._id.toString()) || 0
        };
    });
      return paginatedProducts;
  }
    
  async getProductSummary(): Promise<ProductSummaryResponse> {
      const totalProducts = await this.productModel.countDocuments({});

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newProducts = await this.productModel.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
      });

      const returningProducts = await this.productModel.aggregate([
          {
              $group: {
                  _id: "$product",
                  orderCount: { $sum: 1 }
              }
          },
          {
              $match: {
                  orderCount: { $gt: 1 }
              }
          },
          {
              $count: "returningProducts"
          }
      ]);

      return {
          totalProducts,
          newProducts,
          returningProducts: returningProducts[0]?.returningProducts || 0
      };
  }
    
    async getProductMetrics(data: GetProductRangeFilter): Promise<any[]> {
        const productMetrics = await this.productModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: data.startDate,
                        $lte: data.endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalProducts: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $dateToString: {
                            format: "%Y-%m",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month"
                                }
                            }
                        }
                    },
                    totalProducts: 1
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);
  
        return productMetrics;
    }
    
    async deleteProduct(productId: string, session?: ClientSession): Promise<Boolean> {
      const product = await this.productModel.findByIdAndUpdate(
        productId,
        { isDeleted: true },
        { new: true, session }
      );
    
      if (!product) {
        throw new HandleException(
          HTTP_STATUS_CODES.NOT_FOUND,
          Msg.ERROR_RIDER_NOT_FOUND(productId)
        );
      }
    
      return true;
    }
  async getTopCategories(
    page = 1,
    filter: GetProductsFilter,
    limit = 5
  ): Promise<PaginateResult<IProductCategoryDocument>> {
    const options = createPaginationOptions(
      page,
      {
        select: "_id name createdAt",
        sort: { createdAt: filter.sort === SORT_ORDER.ASC ? 1 : -1 }
      },
      limit
    );
  
    const filterQuery: FilterQuery<IProductCategoryDocument> = {};
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
  
    const topCategories = await Order.aggregate([
      {
        $match: { status: ORDER_STATUS.DELIVERED }
      },
      {
        $unwind: "$items"
      },
      {
        $lookup: {
          from: DB_SCHEMA.PRODUCT,
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalDeliveries: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalDeliveries: -1 } },
      {
        $lookup: {
          from: DB_SCHEMA.PRODUCT_CATEGORY,
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          _id: "$categoryDetails._id",
          name: "$categoryDetails.name",
          totalDeliveries: 1
        }
      }
    ]);
  
    const categoryIds = topCategories.map((category: any) => category._id);
    const totalDeliveriesMap = new Map(topCategories.map(c => [c._id.toString(), c.totalDeliveries]));
  
    const paginatedCategories: PaginateResult<IProductCategoryDocument> = await this.productCategoryModel.paginate(
      { _id: { $in: categoryIds }, ...filterQuery },
      options
    );
  
    paginatedCategories.docs = paginatedCategories.docs.map((category: any) => {
      const categoryObj = category.toObject();
      return {
        ...categoryObj,
        totalDeliveries: totalDeliveriesMap.get(category._id.toString()) || 0
      };
    });
  
    return paginatedCategories;
  }
}


