import { describe, expect, it } from "vitest";
import { computeFan, DEFAULT_FAN_INPUTS } from "./fan";

describe("fan affinity laws", () => {
  const base = computeFan(DEFAULT_FAN_INPUTS);
  const doubled = computeFan({ ...DEFAULT_FAN_INPUTS, rpm: DEFAULT_FAN_INPUTS.rpm * 2 });

  it("doubling speed doubles airflow", () => {
    expect(doubled.flow / base.flow).toBeCloseTo(2, 6);
  });

  it("doubling speed quadruples pressure", () => {
    expect(doubled.pressure / base.pressure).toBeCloseTo(4, 6);
  });

  it("doubling speed multiplies power by eight", () => {
    expect(doubled.electricalPower / base.electricalPower).toBeCloseTo(8, 6);
  });

  it("a stopped fan moves no air and draws no power", () => {
    const stopped = computeFan({ ...DEFAULT_FAN_INPUTS, rpm: 0 });
    expect(stopped.flow).toBe(0);
    expect(stopped.electricalPower).toBe(0);
  });

  it("operating point sits on both the fan and system curve", () => {
    const fanP = base.shutoffPressure * (1 - (base.flow / base.freeDelivery) ** 2);
    expect(base.pressure).toBeCloseTo(fanP, 6);
  });
});
