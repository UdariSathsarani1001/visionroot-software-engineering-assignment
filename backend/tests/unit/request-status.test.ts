import { canTransition } from "../../src/services/request-status.service";
import { RequestStatus } from "../../src/constants/request.constants";

const { PENDING, IN_PROGRESS, RESOLVED, CANCELLED } = RequestStatus;

describe("canTransition", () => {
  // Valid transitions
  it("PENDING -> IN_PROGRESS is valid", () => {
    expect(canTransition(PENDING, IN_PROGRESS)).toBe(true);
  });

  it("PENDING -> CANCELLED is valid", () => {
    expect(canTransition(PENDING, CANCELLED)).toBe(true);
  });

  it("IN_PROGRESS -> RESOLVED is valid", () => {
    expect(canTransition(IN_PROGRESS, RESOLVED)).toBe(true);
  });

  it("IN_PROGRESS -> CANCELLED is valid", () => {
    expect(canTransition(IN_PROGRESS, CANCELLED)).toBe(true);
  });

  // Invalid transitions
  it("RESOLVED -> anything is invalid", () => {
    expect(canTransition(RESOLVED, PENDING)).toBe(false);
    expect(canTransition(RESOLVED, IN_PROGRESS)).toBe(false);
    expect(canTransition(RESOLVED, CANCELLED)).toBe(false);
  });

  it("CANCELLED -> anything is invalid", () => {
    expect(canTransition(CANCELLED, PENDING)).toBe(false);
    expect(canTransition(CANCELLED, IN_PROGRESS)).toBe(false);
    expect(canTransition(CANCELLED, RESOLVED)).toBe(false);
  });

  it("PENDING -> RESOLVED is invalid (must go through IN_PROGRESS)", () => {
    expect(canTransition(PENDING, RESOLVED)).toBe(false);
  });

  it("IN_PROGRESS -> PENDING is invalid (no backwards transitions)", () => {
    expect(canTransition(IN_PROGRESS, PENDING)).toBe(false);
  });

  it("self-transition is invalid", () => {
    expect(canTransition(PENDING, PENDING)).toBe(false);
    expect(canTransition(IN_PROGRESS, IN_PROGRESS)).toBe(false);
  });
});
