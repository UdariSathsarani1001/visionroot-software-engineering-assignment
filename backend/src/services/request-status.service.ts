import {
  RequestStatus,
  STATUS_TRANSITIONS,
} from "../constants/request.constants.js";

/**
 * Pure function — no side effects.
 * Returns true when `current -> next` is a valid transition.
 */
export function canTransition(
  current: RequestStatus,
  next: RequestStatus
): boolean {
  return STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}
