import { connectDB } from "./lib/mongodb.js";
import mongoose from "mongoose";
import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY;
const LOCATION = "25.0330,121.5654";
const RADIUS = 5000;

async function testDB() {
  try {
    const db = await connectDB();
    console.log("MongoDB connection success!");

    console.log("DB Name:", db.connection.name);
    console.log("DB Host:", db.connection.host);

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

async function testGoogleAPI() {
  console.log("Google API Key:", GOOGLE_API_KEY);

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LOCATION}&radius=${RADIUS}&type=cafe&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(url);
    console.log("google request: ", response.data.results[0]);
  } catch (error) {
    console.error("failed connection: ", error.message);
  }
}



// testDB();
testGoogleAPI();
