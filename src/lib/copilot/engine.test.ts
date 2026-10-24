import { describe, expect, it } from "vitest";
import { findAnswer } from "./engine";

const ctx = { route: "/lab", depth: "simple" as const };

describe("copilot knowledge lookup", () => {
  it("answers affinity-law questions with the affinity topic", () => {
    expect(findAnswer("What happens if I double the fan speed?", ctx)?.id).toBe("affinity");
  });

  it("explains the selected part when asked about 'this'", () => {
    expect(findAnswer("explain this", { ...ctx, selectedPart: "shroud" })?.id).toBe("part-shroud");
  });

  it("routes failure questions to failure entries", () => {
    expect(findAnswer("Why does the front bearing fail from grease degradation?", ctx)?.id).toBe("fail-F-01");
  });
});
