// import * as React from 'react';

import {
  calculateChangedBitsOfArray,
  // createArrayContext,
  // useArrayContext,
} from "./index";

describe("calculateChangedBitsOfArray", () => {
  let before: any[];
  let after: any[];

  it("puts a 1 in the ith bit if the ith element changed", () => {
    before = ["a", "b", "c"];
    after = ["a", "g", "c"];
    expect(calculateChangedBitsOfArray(before, after)).toBe(0b010);

    before = ["a", "b", "c"];
    after = ["a", "b", "g"];
    expect(calculateChangedBitsOfArray(before, after)).toBe(0b100);

    before = ["a", "b", "c"];
    after = ["d", "e", "f"];
    expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);
  });

  it("handles empty arrays", () => {
    before = [];
    after = [];
    expect(calculateChangedBitsOfArray(before, after)).toBe(0b0);

    before = [];
    after = ["a", "a", "a"];
    expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);

    before = ["a", "a", "a"];
    after = [];
    expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);
  });
});
