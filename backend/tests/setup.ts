// Load env before anything else — use test-specific values
process.env["PORT"] = "5001";
process.env["NODE_ENV"] = "test";
process.env["MONGODB_URI"] =
  process.env["MONGODB_URI"] ||
  "mongodb+srv://chethanasathsarani1001_db_user:ew80FAA9BUeq8zbr@cluster0.aiygoob.mongodb.net/visionroot_test?retryWrites=true&w=majority";
process.env["JWT_ACCESS_SECRET"] = "test_access_secret_at_least_32_chars_long";
process.env["JWT_REFRESH_SECRET"] = "test_refresh_secret_at_least_32_chars_long";
process.env["ACCESS_TOKEN_EXPIRES_IN"] = "15m";
process.env["REFRESH_TOKEN_EXPIRES_IN"] = "7d";
process.env["FRONTEND_URL"] = "http://localhost:3000";
