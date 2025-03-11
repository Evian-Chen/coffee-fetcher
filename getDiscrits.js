// getDiscrits.js

// 這份檔案抓取test database底下的行政區資料

import mongoose from "mongoose";
import DistrictSchema from "./models/District.js";
import dotenv from "dotenv";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_COFFEE_SHOP;

export async function getDiscrits() {
    // 進入test資料庫取得行政區
    await mongoose.connect(`${MONGODB_URI}/test?retryWrites=true&w=majority`);

    const regions = {};

    try {
        const District = mongoose.models.District || mongoose.model("district", DistrictSchema);
        const discricts = await District.find({}).lean();
        discricts.forEach(({city, district}) => {
            if (!regions[city]) {
                regions[city] = [];
            }
            regions[city].push(district);
        });
        return regions;

    } catch (err) {
        console.log("error: ", err)
        return {};
    } 
}