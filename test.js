import { connectDB } from "./lib/mongodb.js";
import mongoose from "mongoose";
import axios from "axios";
import fs from "fs";
import { getDiscrits } from "./getDiscrits.js";
import { getCafeShopModel } from "./models/CoffeeShop.js";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY;
const MONGODB_COFFEE_SHOP = process.env.MONGODB_COFFEE_SHOP;

async function saveToMongoDB(shop, city, district, cafeModel) {
  console.log("shop: \n", shop, "\n\n===========\n");
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shop.place_id}&language=zh-TW&key=${GOOGLE_API_KEY}`;
  const detail = await axios.get(detailsUrl);

  const coffeeShopData = {
    city,
    district,
    name: shop.name,
    place_id: shop.place_id,
    vicinity: shop.vicinity || "",
    rating: shop.rating || 0,
    price_level: shop.price_level || null,
    weekday_text: shop.opening_hours?.weekday_text || [],
    formatted_address: shop.formatted_address || "",
    formatted_phone_number: shop.formatted_phone_number || "",
    services: {
      serves_beer: false,
      serves_breakfast: false,
      serves_brunch: false,
      serves_dinner: false,
      serves_lunch: false,
      serves_wine: false,
      takeout: shop.business_status === "OPERATIONAL",
    },
    types: shop.types || [],
    user_rating_total: shop.user_ratings_total || 0,
    reviews:
      shop.reviews?.map((review) => ({
        reviewer_name: review.author_name,
        reviewer_rating: review.rating,
        review_text: review.text,
        review_time: review.relative_time_description,
      })) || [],
  };

  await cafeModel.updateOne(
    { place_id: shop.place_id },
    { $set: coffeeShopData },
    { upsert: true }
  );
}

async function fetchCafesByRegion(city, district) {
  let allResults = [];
  let seenPlaceIds = new Set();

  // get city collection connection
  const cafeModel = getCafeShopModel(city);

  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${district}+${city}&type=cafe&language=zh-TW&key=${GOOGLE_API_KEY}`;
  let next_page = null;

  console.log(`fetching ${city} - ${district} cafe`);

  while (url) {
    let response = await axios.get(url);
    let data = response.data;

    if (!data.results || data.results.length === 0) break;

    for (let shop of data.results) {
      if (!seenPlaceIds.has(shop.place_id)) {
        seenPlaceIds.add(shop.place_id);
        allResults.push(shop);
        saveToMongoDB(shop, city, district, cafeModel);
      }
    }

    console.log(`${city} - ${district} get ${allResults.length}`);

    next_page = data.next_page_token;
    if (next_page) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${next_page}&language=zh-TW&key=${GOOGLE_API_KEY}`;
    } else {
      url = null;
    }
  }

  return { city, district, cafes: allResults };
}

async function fetchAllShops() {
  let finalResults = {};
  const taiwanRegions = await getDiscrits();

  for (const [city, districts] of Object.entries(taiwanRegions)) {
    console.log("city: ", city);
    console.log("dis: ", districts);

    finalResults[city] = {};

    for (const district of districts) {
      console.log("d:", district);
      const regionData = await fetchCafesByRegion(city, district);
      finalResults[city][district] = regionData.cafes;
    }
  }

  console.log("fetched all cities: ", finalResults);

  fs.writeFileSync(
    "coffee_shops_by_district.json",
    JSON.stringify(finalResults, null, 2),
    "utf-8"
  );
  console.log("data saved to coffee_shops_by_district.json");
}

async function testGoogleAPI() {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LOCATION}&radius=${RADIUS}&type=cafe&language=zh-TW&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${response.data.results[0].place_id}&language=zh-TW&key=${GOOGLE_API_KEY}`;
    const details = await axios.get(detailsUrl);
    console.log(
      "weekday_text: ",
      details.data.result.current_opening_hours.weekday_text
    );
    console.log("formatted_address: ", details.data.result.formatted_address);

    // not only one photos(or maybe no photos), need to request using different url
    console.log("photos len: ", details.data.result.photos.length);
    console.log("photos: ", details.data.result.photos[0].photo_reference);
    // const photoRef = details.data.result.photos[0].photo_reference;
    // const photoURL = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
    // console.log(photoURL);

    console.log("serves_beer: ", details.data.result.serves_beer);
    console.log("serves_breakfast: ", details.data.result.serves_breakfast);
    console.log("serves_brunch: ", details.data.result.serves_brunch);
    console.log("serves_dinner: ", details.data.result.serves_dinner);
    console.log("serves_lunch: ", details.data.result.serves_lunch);
    console.log("serves_wine: ", details.data.result.serves_wine);
    console.log("takeout: ", details.data.result.takeout);
    console.log("types: ", details.data.result.types);
    console.log("user_ratings_total: ", details.data.result.user_ratings_total);
    console.log(
      "formatted_phone_number: ",
      details.data.result.formatted_phone_number
    );

    // not only one reviewer, or maybe zero, need to expand the reviews
    console.log("review len: ", details.data.result.reviews.length);
    console.log("reviewer: ", details.data.result.reviews[0].author_name);
    console.log("reviewer_rating: ", details.data.result.reviews[0].rating);
    console.log(
      "review_text: ",
      details.data.result.reviews[0].text.split(/\s+/).join("")
    );

    // review time should be converted to local time (originally a timestamp)
    console.log("review_time: ", details.data.result.reviews[0].time);
    const date = new Date(details.data.result.reviews[0].time * 1000);
    console.log("timestamp_convert: ", date.toLocaleDateString());
  } catch (error) {
    console.error("failed connection: ", error.message);
  }
}

// const d = await getDiscrits();
// Object.entries(d).forEach(async ([city, districts]) => {
//   console.log("city: ", city);
//   console.log("dis: ", districts);

//   for (const district of districts) {
//     console.log("dict: ", district);
//   }
// });
// console.log(d);
// console.log(Object.entries(d)[0]);

// testGoogleAPI();
fetchAllShops();

// get the lantitude and longtitude of all taiwan cities
// const lc = await getLoactions();
// console.log(lc);

// for (const [city, loc] of Object.entries(lc)) {
//   console.log("key: " + city + " loc: " + loc);
// }
