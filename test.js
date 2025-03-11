import { connectCityDB } from "./lib/mongodb.js";
import mongoose, { mongo } from "mongoose";
import axios from "axios";
import fs from "fs";
import { getDiscrits } from "./getDiscrits.js";
import CoffeeShopSchema from "./models/CoffeeShop.js";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY;
const MONGODB_COFFEE_SHOP = process.env.MONGODB_COFFEE_SHOP;

async function saveToMongoDB(shop, city, district, cafeModel) {
  console.log("shop: \n", city, "-", district);

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shop.place_id}&language=zh-TW&key=${GOOGLE_API_KEY}`;
  const detail = await axios.get(detailsUrl);
  const detailData = detail.data.result;

  // console.log("debug: ", detailData);

  // 先整理評論的資料
  let reviewsData = [];
  if (detailData.reviews && Array.isArray(detailData.reviews)) {
    for (let i = 0; i < detailData.reviews.length; i++) {
      const review = detailData.reviews[i];

      reviewsData.push({
        reviewer_name: review.author_name || "Unknown",
        reviewer_rating: review.rating || 0,
        review_text: review.text ? review.text.split(/\s+/).join(" ") : "",
        review_time: review.relative_time_description || "Unknown",
      });
    }
  }

  let weekday = []
  if (!detailData.current_opening_hours) {
    weekday = [] || detailData.current_opening_hours.weekday_text;
  } else {
    weekday = ["not provided"];
  }

  const coffeeShopData = {
    // from original shop data
    city,
    district,
    name: shop.name,
    place_id: shop.place_id,
    rating: shop.rating || 0,
    price_level: shop.price_level || null,
    formatted_address: shop.formatted_address || "",
    types: shop.types || [],

    // from detail
    vicinity: detail.vicinity || "",
    weekday_text: weekday,
    formatted_phone_number: detailData.formatted_phone_number || "",
    services: {
      serves_beer: detailData.serves_beer,
      serves_breakfast: detailData.serves_breakfast,
      serves_brunch: detailData.serves_brunch,
      serves_dinner: detailData.serves_dinner,
      serves_lunch: detailData.serves_lunch,
      serves_wine: detailData.serves_wine,
      takeout: detailData.takeout === "OPERATIONAL",
    },

    user_rating_total: detailData.user_rating_total || 0,

    reviews: reviewsData,
  };

  console.log("data to be saved:\n", shop.name, ": ", shop.place_id);

  await cafeModel.updateOne(
    { place_id: shop.place_id },
    { $set: coffeeShopData },
    { upsert: true }
  );

  console.log("save ", shop.name);

}

async function fetchCafesByRegion(city, district, cityConn) {
  let allResults = [];
  let seenPlaceIds = new Set();

  // 此 model 連接到目前 city 底下的 district collection
  let cafeModel = cityConn.model(district, CoffeeShopSchema);

  // 取得該縣市與行政區的google map資料
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
        allResults.push(shop.name);
        await saveToMongoDB(shop, city, district, cafeModel);
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
  // 取得縣市與行政區，結束後關閉連線
  const regions = await getDiscrits();
  await mongoose.connection.close();

  let finalResults = {};
  
  for (const [city, districts] of Object.entries(regions)) {
    console.log("city: ", city);
    console.log("dis: ", districts);

    finalResults[city] = {};

    // 取得目前縣市的連線
    const cityConn = await connectCityDB(city);

    for (const district of districts) {
      console.log("d:", district);

      // 搜尋單個行政區的咖啡廳
      const regionData = await fetchCafesByRegion(city, district, cityConn);
      console.log("finised fetching ", district);
      finalResults[city][district] = regionData.cafes;
    }

    console.log("finished fetching ", city, "\n==\n");
    // process.exit(0);
  }

  console.log("fetched all cities: ", finalResults.length);

  fs.writeFileSync(
    "coffee_shops_by_district.json",
    JSON.stringify(finalResults, null, 2),
    "utf-8"
  );
  console.log("data saved to coffee_shops_by_district.json");

  await mongoose.connection.close();
}


fetchAllShops();
