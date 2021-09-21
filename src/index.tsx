// eslint-disable-next-line
import React, { createContext, useContext, useState } from "react";
import type { Context, Dispatch, SetStateAction, FC } from "react";

export type ContextValue<T> = {
  state: T[];
  setState: Dispatch<SetStateAction<T[]>>;
};

export function calculateChangedBitsOfArray<T>(
  contextValue: ContextValue<T>,
  nextContextValue: ContextValue<T>
) {
  let changedBits = 0;

  for (
    let i = 0;
    i < Math.max(contextValue?.state?.length, nextContextValue?.state?.length);
    i++
  ) {
    const isChanged = contextValue?.state[i] !== nextContextValue?.state[i];
    if (isChanged) {
      const bit = 1 << i;
      changedBits = changedBits | bit;
    }
  }

  return changedBits;
}

type CreateArrayContext<T> = [
  FC<{ initialState: T[] }>,
  (observedIndices?: number[]) => ContextValue<T>,
  Context<ContextValue<T> | null>
];

export function createArrayContext<T>(): CreateArrayContext<T> {
  const ArrayContext = createContext<ContextValue<T> | null>(
    null,
    // @ts-ignore (second argument of createContext is not documented)
    calculateChangedBitsOfArray
  );

  function ArrayContextProvider({
    initialState,
    ...rest
  }: {
    initialState: T[];
  }) {
    const [state, setState] = useState<T[]>(initialState);
    return <ArrayContext.Provider value={{ state, setState }} {...rest} />;
  }

  function useArrayContext(observedIndices: number[] = []) {
    let observedBits = 0;

    if (observedIndices.length) {
      for (const index of observedIndices) {
        observedBits = observedBits | index;
      }
    }

    // @ts-ignore (second argument of useContext is not documented)
    const contextValue = useContext(ArrayContext, observedBits || undefined);

    if (!contextValue) {
      throw Error(
        "Must use `useArrayContext` inside of an `ArrayContextProvider`"
      );
    }

    return contextValue;
  }

  return [ArrayContextProvider, useArrayContext, ArrayContext];
}