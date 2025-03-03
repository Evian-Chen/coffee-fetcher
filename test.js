import { connectDB } from "./lib/mongodb.js";
import mongoose from "mongoose";
import axios from "axios";
import { getLoactions } from "./lib/locationCrawler.js";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY;
const LOCATION = "25.0330,121.5654"; // (latitude, longitude)
const RADIUS = 5000;  // meter

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
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LOCATION}&radius=${RADIUS}&type=cafe&language=zh-TW&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${response.data.results[0].place_id}&language=zh-TW&key=${GOOGLE_API_KEY}`
    const details = await axios.get(detailsUrl);
    console.log("weekday_text: ", details.data.result.current_opening_hours.weekday_text);
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
    console.log("formatted_phone_number: ", details.data.result.formatted_phone_number);

    // not only one reviewer, or maybe zero, need to expand the reviews
    console.log("review len: ", details.data.result.reviews.length);
    console.log("reviewer: ", details.data.result.reviews[0].author_name);
    console.log("reviewer_rating: ", details.data.result.reviews[0].rating);
    console.log("review_text: ", details.data.result.reviews[0].text.split(/\s+/).join(''));
    
    // review time should be converted to local time (originally a timestamp)
    console.log("review_time: ", details.data.result.reviews[0].time);
    const date = new Date(details.data.result.reviews[0].time * 1000);
    console.log("timestamp_convert: ", date.toLocaleDateString());
  } catch (error) {
    console.error("failed connection: ", error.message);
  }
}

// testDB();
testGoogleAPI();

// get the lantitude and longtitude of all taiwan cities
// const lc = await getLoactions();
// console.log(lc);
