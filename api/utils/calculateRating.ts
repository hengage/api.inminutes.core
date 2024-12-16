import { IRiderDocument } from "../features/riders";
import { IVendorDocument } from "../features/vendors";

export const calculateAverageRating = (
  merchant: IRiderDocument | IVendorDocument,
  rating: number,
): number => {
  // Increase the number of times the account has been rated
  merchant.rating.ratingCount += 1;

  // Add the new rating to the sum of the previous ratings
  merchant.rating.totalRatingSum += rating;

  // Calculate the average rating
  const averageRating =
    merchant.rating.totalRatingSum / merchant.rating.ratingCount;

  return averageRating;
};
