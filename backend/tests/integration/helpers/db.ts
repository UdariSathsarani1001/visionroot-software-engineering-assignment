import mongoose from "mongoose";

export async function connectTestDB(): Promise<void> {
  const uri = process.env["MONGODB_URI"]!;
  await mongoose.connect(uri);
}

export async function clearCollections(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]!.deleteMany({});
  }
}

export async function disconnectTestDB(): Promise<void> {
  await mongoose.disconnect();
}
