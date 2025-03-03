// models/District.js

import mongoose from "mongoose";

const DistrictSchema = new mongoose.Schema({
  city: { type: String, required: true },
  district: { type: String, required: true }
});

export default DistrictSchema;
