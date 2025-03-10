import { connectBaseDB, connectCityDB } from "./lib/mongodb.js";
import mongoose, { mongo } from "mongoose";
import axios from "axios";
import fs, { readlink } from "fs";
import { getDiscrits } from "./getDiscrits.js";
import CoffeeShopSchema from "./models/CoffeeShop.js";
import readline from "readline";
import { resolve } from "path";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY;
const MONGODB_COFFEE_SHOP = process.env.MONGODB_COFFEE_SHOP;

// async function saveToMongoDB(shop, city, district, cafeModel) {
//   if (mongoose.connection.readyState !== 1) {
//     console.error("mongo not connected yet");
//     await connectDB();
//   }

//   console.log("shop: \n", city, "-", district, "\n===========\n");

//   const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shop.place_id}&language=zh-TW&key=${GOOGLE_API_KEY}`;
//   const detail = await axios.get(detailsUrl);
//   const detailData = detail.data.result;

//   let reviewsData = [];
//   if (detailData.reviews && Array.isArray(detailData.reviews)) {
//     for (let i = 0; i < detailData.reviews.length; i++) {
//       const review = detailData.reviews[i];

//       reviewsData.push({
//         reviewer_name: review.author_name || "Unknown",
//         reviewer_rating: review.rating || 0,
//         review_text: review.text ? review.text.split(/\s+/).join(" ") : "",
//         review_time: review.relative_time_description || "Unknown",
//       });
//     }
//   }

//   const coffeeShopData = {
//     // from original shop data
//     city,
//     district,
//     name: shop.name,
//     place_id: shop.place_id,
//     rating: shop.rating || 0,
//     price_level: shop.price_level || null,
//     formatted_address: shop.formatted_address || "",
//     types: shop.types || [],

//     // from detail
//     vicinity: detail.vicinity || "",
//     weekday_text: detailData.current_opening_hours.weekday_text || [],
//     formatted_phone_number: detailData.formatted_phone_number || "",
//     services: {
//       serves_beer: detailData.serves_beer,
//       serves_breakfast: detailData.serves_breakfast,
//       serves_brunch: detailData.serves_brunch,
//       serves_dinner: detailData.serves_dinner,
//       serves_lunch: detailData.serves_lunch,
//       serves_wine: detailData.serves_wine,
//       takeout: detailData.takeout === "OPERATIONAL",
//     },

//     user_rating_total: detailData.user_rating_total || 0,

//     reviews: reviewsData,
//   };

//   await cafeModel.updateOne(
//     { place_id: shop.place_id },
//     { $set: coffeeShopData },
//     { upsert: true }
//   );

//   console.log("save ", shop.name);

//   await pauseExcution();
// }

// async function pauseExcution() {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   return new Promise((resolve) => {
//     rl.question("press enter...", () => {
//       rl.close();
//       resolve();
//     });
//   });
// }

// async function fetchCafesByRegion(city, district) {
//   let allResults = [];
//   let seenPlaceIds = new Set();

//   // get city collection connection
//   console.log("getting shop model");
//   if (!mongoose.connection.readyState) {
//     console.error("trying to get model but mongoDB not connected");
//     await connectDB();
//   }

//   let cafeModel = getCafeShopModel(city);
//   console.log("cafeModel: ", cafeModel);

//   let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${district}+${city}&type=cafe&language=zh-TW&key=${GOOGLE_API_KEY}`;
//   let next_page = null;

//   console.log(`fetching ${city} - ${district} cafe`);

//   while (url) {
//     let response = await axios.get(url);
//     let data = response.data;

//     if (!data.results || data.results.length === 0) break;

//     for (let shop of data.results) {
//       if (!seenPlaceIds.has(shop.place_id)) {
//         seenPlaceIds.add(shop.place_id);
//         allResults.push(shop);
//         await saveToMongoDB(shop, city, district, cafeModel);
//       }
//     }

//     console.log(`${city} - ${district} get ${allResults.length}`);

//     next_page = data.next_page_token;
//     if (next_page) {
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${next_page}&language=zh-TW&key=${GOOGLE_API_KEY}`;
//     } else {
//       url = null;
//     }
//   }

//   return { city, district, cafes: allResults };
// }

async function ensureDatabaseExists(city) {
  const testData = {
    city: city,
    district: "district",
    name: "測試咖啡廳二號",
    place_id: "test_place_id_456",
    vicinity: "測試測試測試測試路 123 號",
    rating: 4.5,
    price_level: 2,

    // Address & Contact
    weekday_text: [
      "星期一: 08:00 – 22:00",
      "星期二: 08:00 – 22:00",
      "星期三: 08:00 – 22:00",
      "星期四: 08:00 – 22:00",
      "星期五: 08:00 – 22:00",
      "星期六: 09:00 – 23:00",
      "星期日: 09:00 – 23:00",
    ],
    formatted_address: `${city}測試路 123 號`,
    formatted_phone_number: "02-1234-5678",

    // Services
    services: {
      serves_beer: false,
      serves_breakfast: true,
      serves_brunch: true,
      serves_dinner: false,
      serves_lunch: true,
      serves_wine: false,
      takeout: true,
    },

    types: [
      "cafe",
      "restaurant",
      "food",
      "point_of_interest",
      "establishment",
    ],

    // Ratings & Reviews
    user_rating_total: 125,
    reviews: [
      {
        reviewer_name: "張小明",
        reviewer_rating: 5,
        review_text: "這間咖啡廳的氣氛很棒，咖啡非常香醇！",
        review_time: "2 週前",
      },
      {
        reviewer_name: "李美麗",
        reviewer_rating: 4,
        review_text: "餐點不錯，但人有點多，稍微吵雜。",
        review_time: "1 個月前",
      },
      {
        reviewer_name: "王大明",
        reviewer_rating: 3,
        review_text: "普通，沒有特別讓人驚艷的地方。",
        review_time: "3 個月前",
      },
    ],
  };

  const cityConn = await connectCityDB(city);

  if (!cityConn) {
    console.log("no connection to city");
  }
  const db = cityConn.db;

  // 得到所有collection（行政區）
  const collections = await db.listCollections().toArray();
  console.log("Collections: ", collections[0].name);

  // 抓出行政區底下的document
  const collection = db.collection(collections[0].name);
  let data = await collection.find({}).limit(10).toArray(); 
  // data是一個物件的陣列
  // console.log(data[0]);

  // 在該行政區中插入一筆資料
  await collection.insertOne(testData);
  data = await collection.find({}).limit(10).toArray();
  console.log(data);

  process.exit(0);
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

    // set up collection
    await ensureDatabaseExists(city);
    mongoose.connection.close();

  //   for (const district of districts) {
  //     console.log("d:", district);
  //     const regionData = await fetchCafesByRegion(city, district);
  //     finalResults[city][district] = regionData.cafes;
  //   }
  }

  // console.log("fetched all cities: ", finalResults.length);

  // fs.writeFileSync(
  //   "coffee_shops_by_district.json",
  //   JSON.stringify(finalResults, null, 2),
  //   "utf-8"
  // );
  // console.log("data saved to coffee_shops_by_district.json");
}


async function testGoogleAPI() {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=25.0330,121.5654&radius=1000&type=cafe&language=zh-TW&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${response.data.results[0].place_id}&language=zh-TW&key=${GOOGLE_API_KEY}`;
    const details = await axios.get(detailsUrl);

    let data = response.data;

    for (let shop of data.results) {
      let detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shop.place_id}&language=zh-TW&key=${GOOGLE_API_KEY}`;
      let detail = await axios.get(detailsUrl);
      let detailData = detail.data.result;

      console.log("placeId: ", shop.place_id);
      console.log("rating: ", shop.rating);
      console.log("price_level: ", shop.price_level);
      console.log("formatted_address: ", shop.formatted_address);
      console.log("types: ", shop.types);

      console.log("vicinity: ", detailData.vicinity);
      console.log(
        "weekday_text: ",
        detailData.current_opening_hours.weekday_text
      );
      console.log(
        "formatted_phone_number: ",
        detailData.formatted_phone_number
      );
      console.log("serves_beer: ", detailData.serves_beer);
      console.log("serves_breakfast: ", detailData.serves_breakfast);
      console.log("serves_brunch: ", detailData.serves_brunch);
      console.log("serves_dinner: ", detailData.serves_dinner);
      console.log("serves_lunch: ", detailData.serves_lunch);
      console.log("serves_wine: ", detailData.serves_wine);
      console.log("takeout: ", detailData.takeout);

      console.log("user_rating_total: ", detailData.user_rating_total);

      for (let i = 0; i < detailData.reviews.length; i++) {
        console.log("reviewer: ", detailData.reviews[i].author_name);
        console.log("rating: ", detailData.reviews[i].rating);
        console.log("text: ", detailData.reviews[i].text.split(/\s+/).join(""));
        console.log(
          "relative_time_description: ",
          detailData.reviews[i].relative_time_description
        );
      }
      console.log("\n\n\n\n====================\n\n\n\n");
    }
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
// fetchAllShops();

// setupShopDB();

fetchAllShops();


// get the lantitude and longtitude of all taiwan cities
// const lc = await getLoactions();
// console.log(lc);

// for (const [city, loc] of Object.entries(lc)) {
//   console.log("key: " + city + " loc: " + loc);
// }
