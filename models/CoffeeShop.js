// models/CoffeeShop.js

import mongoose from "mongoose";

/**
 * @typedef {Object} Review
 * @property {string} reviewer_name - The name of the reviewer (required).
 * @property {number} reviewer_rating - The rating given by the reviewer (required, range: 0-5).
 * @property {string} review_text - The text content of the review (required).
 * @property {String} review_time - The date the review was created.
 */

/**
 * @typedef {Object} Services
 * @property {boolean} [serves_beer=false] - Indicates if the shop serves beer.
 * @property {boolean} [serves_breakfast=false] - Indicates if the shop serves breakfast.
 * @property {boolean} [serves_brunch=false] - Indicates if the shop serves brunch.
 * @property {boolean} [serves_dinner=false] - Indicates if the shop serves dinner.
 * @property {boolean} [serves_lunch=false] - Indicates if the shop serves lunch.
 * @property {boolean} [serves_wine=false] - Indicates if the shop serves wine.
 * @property {boolean} [takeout=false] - Indicates if takeout is available.
 */

/**
 * @typedef {Object} CoffeeShop
 * @property {string} district
 * @property {string} city
 * @property {string} name - The name of the coffee shop (required).
 * @property {string} place_id - The unique identifier from Google Places API (required, unique).
 * @property {string} vicinity - The general location or area of the coffee shop (required).
 * @property {number} rating - The average rating of the coffee shop (required, range: 0-5).
 * @property {number} [price_level] - The price level of the coffee shop (optional, range: 0-4).
 *
 * @property {string[]} weekday_text - The formatted opening hours for each day of the week (required).
 * @property {string} formatted_address - The full formatted address of the coffee shop (required).
 * @property {string} [formatted_phone_number] - The formatted phone number of the coffee shop (optional).
 *
 * @property {Services} services - An object representing various available services (optional).
 * @property {string[]} [types] - The list of categories assigned to the coffee shop (restricted to predefined values).
 * @property {number} [user_rating_total] - The total number of user ratings.
 *
 * @property {Review[]} [reviews] - An array of reviews left by customers.
 *
 * @property {Date} createdAt - The timestamp when the record was created.
 * @property {Date} updatedAt - The timestamp when the record was last updated.
 */
const CoffeeShopSchema = new mongoose.Schema(
  {
    district: { type: String, required: true },
    city: { type: String, required: true },
    name: { type: String, required: true },
    place_id: { type: String, required: true, unique: true },
    vicinity: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    price_level: { type: Number, min: 0, max: 4 },

    // Address & Contact
    weekday_text: { type: [String], required: true },
    formatted_address: { type: String, required: true },
    formatted_phone_number: { type: String }, // Changed from Number to String

    // Services (Grouped into one object)
    services: {
      serves_beer: { type: Boolean, default: false },
      serves_breakfast: { type: Boolean, default: false },
      serves_brunch: { type: Boolean, default: false },
      serves_dinner: { type: Boolean, default: false },
      serves_lunch: { type: Boolean, default: false },
      serves_wine: { type: Boolean, default: false },
      takeout: { type: Boolean, default: false },
    },

    types: { type: [String] },

    // Total number of ratings
    user_rating_total: { type: Number },

    // Reviews (supports multiple reviews)
    reviews: [
      {
        reviewer_name: { type: String, required: true },
        reviewer_rating: { type: Number, required: true, min: 0, max: 5 },
        review_text: { type: String, required: true },
        review_time: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// export const getCafeShopModel = (city) =>
//   mongoose.models[city] || mongoose.model(city, CoffeeShopSchema, city);

export const getCafeShopModel = (city) => {
  if (mongoose.connection.readyState !== 1) {
    console.error("trying to get model, try connectDB() first");
  }
  return mongoose.models[city] || mongoose.model(city, CoffeeShopSchema, city);
};
