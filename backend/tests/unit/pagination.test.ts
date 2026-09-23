import { parsePagination, buildMeta } from "../../src/utils/pagination";

describe("parsePagination", () => {
  it("returns defaults when no params provided", () => {
    const result = parsePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(0);
  });

  it("calculates skip correctly", () => {
    const result = parsePagination({ page: "3", limit: "20" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(40);
  });

  it("clamps limit to MAX_LIMIT=100", () => {
    const result = parsePagination({ limit: "500" });
    expect(result.limit).toBe(100);
  });

  it("clamps page to minimum 1", () => {
    const result = parsePagination({ page: "-5" });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it("handles non-numeric values gracefully", () => {
    const result = parsePagination({ page: "abc", limit: "xyz" });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});

describe("buildMeta", () => {
  it("computes totalPages correctly", () => {
    const meta = buildMeta(1, 10, 25);
    expect(meta.totalPages).toBe(3);
  });

  it("handles zero total", () => {
    const meta = buildMeta(1, 10, 0);
    expect(meta.totalPages).toBe(0);
    expect(meta.total).toBe(0);
  });

  it("returns correct page and limit", () => {
    const meta = buildMeta(2, 15, 45);
    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(15);
    expect(meta.totalPages).toBe(3);
  });
});
