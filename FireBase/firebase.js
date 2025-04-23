import { getDiscrits } from "../getDiscrits.js";
import { connectCityDB } from "../lib/mongodb.js";
import mongoose from "mongoose";
import CoffeeShopSchema from "../models/CoffeeShop.js";
import { db } from "./init_firebase.js";
import { ref, update } from "firebase/database";

async function getShopData() {
    // 取得縣市與行政區，結束後關閉連線
    const regions = await getDiscrits();
    await mongoose.connection.close();

    for (const [city, districts] of Object.entries(regions)) {
        // 取得目前縣市的連線
        const cityConn = await connectCityDB(city);

        for (const district of districts) {
            // 把縣市底下所有行政區的資料都撈出來
            let cityModel = cityConn.model(district, CoffeeShopSchema);
            const shops = await cityModel.find();

            const updates = {};
            for (const shop of shops) {
                // 使用 Google Places API 的 place_id 作為 key
                const shopName = shop.name.replace(/[\s.#$/\[\]]+/g, "");
                const shopId = `${shopName}_${shop.place_id}`; 
            
                // 把資料放在路徑底下
                updates[`/coffee_shops/${city}/${district}/${shopId}`] = {
                    district: shop.district,
                    city: shop.city,
                    name: shop.name,
                    vicinity: shop.vicinity,
                    rating: shop.rating,
                    price_level: shop.price_level || null,
                    weekday_text: shop.weekday_text,
                    formatted_address: shop.formatted_address,
                    formatted_phone_number: shop.formatted_phone_number || null,
                    services: shop.services,
                    types: shop.types || [],
                    user_rating_total: shop.user_rating_total || 0,
                    reviews: shop.reviews ? JSON.parse(JSON.stringify(shop.reviews)) : [],
                    createdAt: shop.createdAt.toISOString(),
                    updatedAt: shop.updatedAt.toISOString(),
                };
            
                console.log(`${city} -> ${district}: ${shop.name}`);
            
                // 不覆蓋資料
                await update(ref(db), updates); 
                
            }
        }
        
    }

    // 關閉所有連線
    await mongoose.connection.close();
}

var data = await getShopData();
console.log(data);