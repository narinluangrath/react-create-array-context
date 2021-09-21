# React Create Array Context

Efficiently use React Context with arrays

## Motivation

The [React Context API](https://reactjs.org/docs/context.html) has a [hidden second argument](https://github.com/facebook/react/blob/c390ab3643612dc08ca4bebadc5b0377e9e7eb79/packages/react/src/ReactContext.js#L14) called `calculateChangedBits`, which you can use as a [performance optimization](https://dev.to/alexkhismatulin/react-context-a-hidden-power-3h8j) to reduce unecessary renders to context consumers. However, using this API involes knowledge of [bitwise operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators) which makes it tricky to use. This library implements the details of `calculateChangedBits` (and `unstable_observedBits`) for you, **assuming your context state is an array**.

To be honest, I'm not sure this library is useful. If you're experiencing performance issues with React Context, consider using some of the solutions suggested [here](https://github.com/facebook/react/issues/15156#issuecomment-474590693) before reaching for this library.
## Getting Started

### Install

```bash
npm install --save react-create-array-context

# Or yarn
# yarn add react-create-array-context
```

### Basic Usage

```jsx
const [ArrayContextProvider, useArrayContext] = createArrayContext();

// This component will rerender _only_ when the 0th element
// of the context array changes (initially 'substate0')
function ArrayContextConsumer0() {
  const [contextState, setContextState] = useArrayContext([0]);

  const handleChange = (e) => {
    const { value } = e.taraget;
    // 🚨 You must use the callback version when setting
    // 🚨 state because `contextState` may be stale (since it
    // 🚨 doesn't update when 1st or 2nd element change)
    setContextState(arr => {
      const copy = [ ...arr ];
      copy[0] = value;
      return copy;
    })
  }

  return <input onChange={handleChange} value={contextState[0]} />
}

// This component will rerender _only_ when the 0th or 1st element
// of the context array changes
function ArrayContextConsumer12() {
  const [contextState, setContextState] = useArrayContext([1, 2]);

  // Do something with contextState[0] and contextState[1]
}

// This component will rerender when any element of the context array changes
function ArrayContextConsumer() {
  const [contextState, setContextState] = useArrayContext();

  // Do something with contextState
}

function App() {
  <ArrayContextProvider initialState={['substate0', 'substate1', 'substate2']}>
    <ArrayContextConsumer0 />
    <ArrayContextConsumer12 />
    <ArrayContextConsumer />
  </ArrayContextProvider>
}
```

### Caveats

1. You must use the callback version of setting state (see 🚨 emoji above).
2. Because of `calculateChangedBits` only has 32 bits to work with, arrays longer than 32 elements may trigger unnecessary rerenders (but it will still be more efficient than not using this library).