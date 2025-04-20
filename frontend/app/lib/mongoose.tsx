import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL is not defined in environment variables.");
    }

    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error: any) {
    console.error("Error connecting to database:", error.message);
  }
};
