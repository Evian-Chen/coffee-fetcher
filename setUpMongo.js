// setUpMongo.js

// 這個檔案負責建立每個縣市的資料庫(DB)，並且將縣市底下的行政區加入collection

import mongoose, { Mongoose } from "mongoose";
import CoffeeShopSchema from "./models/CoffeeShop.js";
import { getDiscrits } from "./getDiscrits.js";

const MONGODB_URI = process.env.MONGODB_COFFEE_SHOP;

// 取得對每個縣市資料庫的連線
async function connectCityShopDB(city) {
  const uri = `${MONGODB_URI}/${city}?retryWrites=true&w=majority`;
  const conn = await mongoose.createConnection(uri);
  console.log("connected to ", city);
  return conn;
}

// 建立資料庫和collections
async function setupMongo() {
  // 先從test資料庫取得台灣所有縣市與行政區
  await mongoose.connect(`${MONGODB_URI}/test?retryWrites=true&w=majority`);
  const regions = await getDiscrits();
  console.log(regions);
  await mongoose.connection.close();

  for (let [city, d] of Object.entries(regions)) {
    // 建立縣市的資料庫連線（同時建立資料庫）
    const cityConn = await connectCityShopDB(city);

    for (let district of d) {
      // 建立每一個行政區的collection
      const disModel = cityConn.model(district, CoffeeShopSchema);

      const testData = {
        city: city,
        district: district,
        name: "測試咖啡廳",
        place_id: "test_place_id_123",
        vicinity: "台北市中正區測試路 123 號",
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
        formatted_address: `${city}${district}測試路 123 號`,
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

      // 加入測試資料
      await disModel.create(testData);

      console.log(district, " collection set up");
    }
    await cityConn.close();
  }
}

setupMongo();
