// getDiscrits.js

import mongoose from "mongoose";
import DistrictSchema from "./models/District.js";
import { connectDB } from "./lib/mongodb.js";
import dotenv from "dotenv";

dotenv.config();

export async function getDiscrits() {
    await connectDB();
    console.log("connected to mongoDB");

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
    } finally {
        await mongoose.connection.close();
        console.log("mongo connection closed");
    }
}