import { describe, expect, it } from "vitest";
import { getActiveNavId } from "./navigation";

describe("getActiveNavId", () => {
  it.each([
    ["/", "home"],
    ["/courts", "courts"],
    ["/courts/123", "courts"],
    ["/create-game", "create"],
    ["/games", "games"],
    ["/profile", "profile"],
    ["/settings", "settings"],
    ["/support", "support"],
    ["/report-issue", "support"],
  ])("maps %s to %s", (pathname, expected) => {
    expect(getActiveNavId(pathname)).toBe(expected);
  });

  it("does not select an unrelated route", () => {
    expect(getActiveNavId("/players")).toBe("");
  });
});
