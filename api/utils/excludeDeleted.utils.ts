import { Schema } from 'mongoose';

export function excludeDeletedPlugin(schema: Schema) {
  // Apply to .find()
  schema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments'], function () {
    this.where({ isDeleted: false });
  });

  // Apply to .findById()
  schema.pre('findOne', function () {
    const query = this.getQuery();
    if (query._id) {
      this.where({ isDeleted: false });
    }
  });

  // Optional: exclude from .aggregate()
  schema.pre('aggregate', function () {
    this.pipeline().unshift({ $match: { isDeleted: false } });
  });
}
