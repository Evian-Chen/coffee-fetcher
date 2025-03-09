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

const MONGOURL = process.env.MONGODB_COFFEE_SHOP;

if (!MONGOURL) {
  throw new Error(".env mongo url not found mongodb.js");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log("connected MongoDB mongodb.js");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGOURL)
      .then((mongoose) => {
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  console.log("connected to MongoDB successfully mongodb.js");

  mongoose.connection.on("disconnected", () => {
    console.error("! MongoDB connection closed¡Imongodb.js");
  });

  return cached.conn;
}
