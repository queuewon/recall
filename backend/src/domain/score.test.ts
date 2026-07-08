import { describe, expect, it } from "vitest";
import { createScore } from "./score";

describe("createScore", () => {
  it("accepts boundary values 0 and 100", () => {
    expect(createScore(0)).toBe(0);
    expect(createScore(100)).toBe(100);
  });

  it.each([-1, 101, 50.5])("rejects out-of-range or non-integer value %s", (value) => {
    expect(() => createScore(value)).toThrow();
  });
});
