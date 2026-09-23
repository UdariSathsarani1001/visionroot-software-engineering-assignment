import User from "../models/User.model.js";
import { parsePagination, buildMeta } from "../utils/pagination.js";

export async function getUsers(query: { page?: unknown; limit?: unknown }) {
  const { page, limit, skip } = parsePagination(query);

  const [users, total] = await Promise.all([
    User.find({})
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(),
  ]);

  const data = users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));

  return { data, meta: buildMeta(page, limit, total) };
}
