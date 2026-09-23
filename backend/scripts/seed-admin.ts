/**
 * Creates (or promotes) an admin user in the database.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME via env or edit the defaults below.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config(); // loads backend/.env

const MONGODB_URI = process.env["MONGODB_URI"];
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Make sure backend/.env exists.");
  process.exit(1);
}

const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] || "admin@visionroot.com";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "Admin@1234";
const ADMIN_NAME = process.env["ADMIN_NAME"] || "Admin";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models["User"] || mongoose.model("User", userSchema);

async function main() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    // Promote the existing account to ADMIN
    await User.updateOne({ email: ADMIN_EMAIL }, { role: "ADMIN", isActive: true });
    console.log(`✓ Existing account promoted to ADMIN: ${ADMIN_EMAIL}`);
  } else {
    // Create a fresh admin account
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    });
    console.log(`✓ Admin account created: ${ADMIN_EMAIL}`);
  }

  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
