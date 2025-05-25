import { Schema } from "mongoose";

/**
 * Mongoose plugin that automatically excludes soft-deleted documents from queries.
 *  @example
 * // Apply plugin to a schema
 * const userSchema = new Schema({
 *   name: String,
 *   email: String,
 *   isDeleted: { type: Boolean, default: false }
 * });
 * userSchema.plugin(excludeDeletedPlugin);
 *
 * @note
 * - Ensure` documents have an `isDeleted` field (preferably boolean)
 *
 * @bypass
 * Use `includeDeleted: true` in query options to bypass this filter and include deleted documents.
 *
 * For populate operations, set `includeDeleted: true` in the populate options
 */

export function excludeDeletedPlugin(schema: Schema) {
  // Apply to .find()
  schema.pre(
    ["find", "findOne", "findOneAndUpdate", "countDocuments"],
    function () {
      // Check if includeDeleted option is set
      if (!this.getOptions().includeDeleted) {
        this.where({ isDeleted: false });
      }
    }
  );

  // Apply to .findById()
  schema.pre("findOne", function () {
    const query = this.getQuery();
    if (query._id && !this.getOptions().includeDeleted) {
      this.where({ isDeleted: false });
    }
  });

  // Optional: exclude from .aggregate()
  schema.pre("aggregate", function () {
    if (!this.options.includeDeleted) {
      this.pipeline().unshift({ $match: { isDeleted: false } });
    }
  });
}
