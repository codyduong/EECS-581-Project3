/**
 * @author Cody Duong <cody.qd@gmail.com>
 * @file Contains utility functionality
 */

import { Document } from "shared/modules/documentservice/DocumentService.Document";

/**
 * Attempts to open a Document that supports session locking. Errors if not a session-lockable document.
 *
 * Modified from:
 * https://github.com/anthony0br/DocumentService/blob/2bc4e6f053757b8ee0cc3d762aaa3c2d5755bc4a/docs/opening.md
 *
 * @param document The document to open
 * @param {number} [timeout=1600] Timeout in ms
 */
export function stealOpenRetry<T>(document: Document<T>, timeout: number = 1600): ReturnType<Document<T>["Open"]> {
  let result = document.Open();
  let startTime = os.clock();
  if (!result.success && result.reason === "SessionLockedError") {
    let diffTime = os.difftime(os.clock(), startTime) * 1000;
    if (diffTime > timeout) {
      return result;
    }

    const IsOpenAvailable = document.IsOpenAvailable();

    if (IsOpenAvailable.success) {
      document.Steal();
      result = document.Open();
    } else {
      return IsOpenAvailable;
    }
  }

  return result;
}
