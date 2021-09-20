import { createContext, useContext } from "react";
import type { Context } from "react";

export function calculateChangedBitsOfArray<T>(
  state: T[],
  nextState: T[]
): number {
  let changedBits = 0;

  for (let i = 0; i < Math.max(state.length, nextState.length); i++) {
    const isChanged = state[i] !== nextState[i];
    if (isChanged) {
      const bit = 1 << i;
      changedBits = changedBits | bit;
    }
  }

  return changedBits;
}

export function createArrayContext<T>(defaultValue: T[]) {
  // @ts-ignore (second argument of createContext is not documented)
  return createContext<T[]>(defaultValue, calculateChangedBitsOfArray);
}

export function useArrayContext<T>(
  context: Context<T>,
  observedIndices: number[] = []
) {
  let observedBits = 0;

  if (observedIndices.length) {
    for (const index of observedIndices) {
      observedBits = observedBits | index;
    }
  }

  // @ts-ignore (second argument of useContext is not documented)
  return useContext(context, observedBits || undefined);
}
