import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

import { config } from "./app.config";

let gfsBucket: GridFSBucket;

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = config.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

    // Initialize GridFS
    const db = mongoose.connection.db;
    if (db) {
      gfsBucket = new GridFSBucket(db, { bucketName: "uploads" });
      console.log("GridFS initialized");
    }
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export const getGridFSBucket = (): GridFSBucket => {
  if (!gfsBucket) {
    throw new Error(
      "GridFS bucket not initialized. Call connectDatabase first."
    );
  }
  return gfsBucket;
};
