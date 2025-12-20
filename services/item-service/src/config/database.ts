import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb://admin:admin123@localhost:27017/auctionai-users?authSource=admin";
    await mongoose.connect(mongoUri);
    console.log(`Database ok ${mongoose.connection.name}`);
  } catch (error) {
    console.error("Mongodb ko: ", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("Mongo disconnected");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongo error", err);
});
