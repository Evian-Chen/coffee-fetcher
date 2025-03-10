// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();  // read .env file

// const MONGOURL = process.env.MONGODB_COFFEE_SHOP;

// if (!MONGOURL) {
//   throw new Error(".env mongo url not found");
// }

// // catch MongoDB connection, if API restarts, use the current connection
// // avoid repeated connections
// let cached = global.mongoose;
// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// export async function connectDB() {
//   if (cached.conn) {
//     console.log("already connected to DB");
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose
//       .connect(MONGOURL)
//       .then((mongoose) => {
//         return mongoose;
//       });
//   }

//   cached.conn = await cached.promise;
//   console.log("connected succeffully");
//   return cached.conn;
// }

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_COFFEE_SHOP;

// 單純連接到整個資料庫
export async function connectBaseDB() {
  if (!MONGODB_URI) {
    throw new Error(".env mongoDB key not found");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("connected to base mongoDB");
  } catch (err) {
    console.log("error: ", err);
  }
}

// 連接到指定縣市的資料庫
export async function connectCityDB(city) {
  if (!MONGODB_URI) {
    throw new Error(".env mongoDB key not found");
  }

  const uri = `${MONGODB_URI}/${city}?retryWrites=true&w=majority`;
  const conn = await mongoose.createConnection(uri).asPromise();
  console.log(`connected to ${city} database`);

  // 因為要建立model，回傳連線
  return conn;
}
