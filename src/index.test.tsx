import * as React from "react";
import { render } from "@testing-library/react";
import type { FC } from "react";

import { calculateChangedBitsOfArray, createArrayContext } from "./index";
import type { ContextValue } from "./index";

describe("helpers", () => {
  describe("calculateChangedBitsOfArray", () => {
    const before: ContextValue<string> = {
      state: [],
      setState: () => undefined,
    };
    const after: ContextValue<string> = {
      state: [],
      setState: () => undefined,
    };

    it("puts a 1 in the ith bit if the ith element changed", () => {
      before.state = ["a", "b", "c"];
      after.state = ["a", "g", "c"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b010);

      before.state = ["a", "b", "c"];
      after.state = ["a", "b", "g"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b100);

      before.state = ["a", "b", "c"];
      after.state = ["d", "e", "f"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);
    });

    it("handles empty arrays", () => {
      before.state = [];
      after.state = [];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b0);

      before.state = [];
      after.state = ["a", "a", "a"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);

      before.state = ["a", "a", "a"];
      after.state = [];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);
    });

    it("handle arrays of unequal size", () => {
      before.state = ["a"];
      after.state = ["b", "c", "d"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);

      before.state = ["a"];
      after.state = ["a", "c", "d"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b110);

      before.state = ["a", "c", "d"];
      after.state = ["a"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b110);
    });
  });
});

describe("react-create-array-context", () => {
  const [ArrayContextProvider, useArrayContext] = createArrayContext<string>();

  const ArrayContextConsumer: FC<{
    onRerender(x: ContextValue<string>["state"]): void;
    observedIndices?: number[];
    setStateValue?: string[];
    text?: string;
  }> = ({ onRerender, observedIndices, setStateValue, text }) => {
    const { state, setState } = useArrayContext(observedIndices);
    onRerender(state);
    return (
      <button
        onClick={setStateValue ? () => setState(setStateValue) : undefined}
      >
        {text}
      </button>
    );
  };

  it("handles no argument to useArrayContext", () => {
    const initialState = ["a", "b", "c"];
    const mockOnRerender = jest.fn();

    render(
      <ArrayContextProvider initialState={initialState}>
        <ArrayContextConsumer onRerender={mockOnRerender} />
      </ArrayContextProvider>
    );

    expect(mockOnRerender).toHaveBeenCalledTimes(1);
    expect(mockOnRerender).toHaveBeenCalledWith(initialState);
  });
});
