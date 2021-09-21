import * as React from "react";
import { act, render, fireEvent, screen } from "@testing-library/react";
import type { FC } from "react";

import { calculateChangedBitsOfArray, createArrayContext } from "./index";
import type { ContextValue } from "./index";

describe("helpers", () => {
  describe("calculateChangedBitsOfArray", () => {
    const before: ContextValue<string> = [[], () => undefined];
    const after: ContextValue<string> = [[], () => undefined];

    it("puts a 1 in the ith bit if the ith element changed", () => {
      before[0] = ["a", "b", "c"];
      after[0] = ["a", "g", "c"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b010);

      before[0] = ["a", "b", "c"];
      after[0] = ["a", "b", "g"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b100);

      before[0] = ["a", "b", "c"];
      after[0] = ["d", "e", "f"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);
    });

    it("handles empty arrays", () => {
      before[0] = [];
      after[0] = [];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b0);

      before[0] = [];
      after[0] = ["a", "a", "a"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);

      before[0] = ["a", "a", "a"];
      after[0] = [];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);
    });

    it("handle arrays of unequal size", () => {
      before[0] = ["a"];
      after[0] = ["b", "c", "d"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b111);

      before[0] = ["a"];
      after[0] = ["a", "c", "d"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b110);

      before[0] = ["a", "c", "d"];
      after[0] = ["a"];
      expect(calculateChangedBitsOfArray(before, after)).toBe(0b110);
    });
  });
});

describe("react-create-array-context", () => {
  const [ArrayContextProvider, useArrayContext] = createArrayContext<string>();
  const ArrayContextConsumer: FC<{
    onRerender(x: ContextValue<string>[0]): void;
    observedIndices?: number[];
    setStateValue?: string[];
    text?: string;
  }> = ({ onRerender, observedIndices, setStateValue, text }) => {
    const [state, setState] = useArrayContext(observedIndices);
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

  it("rerenders when observed array indices change", () => {
    const initialState = ["a", "b", "c"];
    const newState = ["d", "b", "c"];
    const mockOnRerender = jest.fn();
    const text = "set state";

    render(
      <ArrayContextProvider initialState={initialState}>
        <ArrayContextConsumer
          onRerender={mockOnRerender}
          observedIndices={[0]}
        />
        <ArrayContextConsumer
          onRerender={() => undefined}
          setStateValue={newState}
          text={text}
        />
      </ArrayContextProvider>
    );

    expect(mockOnRerender).toHaveBeenCalledTimes(1);
    expect(mockOnRerender).toHaveBeenCalledWith(initialState);

    act(() => {
      fireEvent.click(screen.getByText(text));
    });

    expect(mockOnRerender).toHaveBeenCalledTimes(2);
    expect(mockOnRerender).toHaveBeenCalledWith(newState);
  });

  it("does not rerender when non-observed array indices change", () => {
    const initialState = ["a", "b", "c"];
    const newState = ["a", "d", "f"];
    const mockOnRerender = jest.fn();
    const text = "set state";

    render(
      <ArrayContextProvider initialState={initialState}>
        <ArrayContextConsumer
          onRerender={mockOnRerender}
          observedIndices={[0]}
        />
        <ArrayContextConsumer
          onRerender={() => undefined}
          setStateValue={newState}
          text={text}
        />
      </ArrayContextProvider>
    );

    expect(mockOnRerender).toHaveBeenCalledTimes(1);
    expect(mockOnRerender).toHaveBeenCalledWith(initialState);

    act(() => {
      fireEvent.click(screen.getByText(text));
    });

    expect(mockOnRerender).toHaveBeenCalledTimes(1);
  });
});
