---
title: "Testing React Hooks with Vitest: How to Verify if Store Reset Function Was Called"
description: "Learn how to test React component hooks with Vitest, mock store functions, and verify function calls using Testing Library. Complete example with TypeScript."
date: 2025-01-25
tags:
    - post
    - vitest
    - typescript
    - javascript
    - react
    - testing
    - hooks
    - store
    - mock
    - react-testing-library

layout: layouts/post.njk
---

Testing frontend is not easy. You are trying to run browser code in a Node environment. What can go wrong?
In this use case, I'll show you how to test if a hook was called inside a component.

## Component and Hook

Our minimal example has 3 files: `use-store.ts`, `my-component.tsx`, and `my-component.test.tsx`.
I'm using `vitest` with `@testing-library/react` and `@testing-library/user-event`.

### my-component.tsx

This is our minimal component. All it does is show a button that triggers the `fullReset` method from the `useStore()` hook after it's clicked.

```typescript
export default function MyComponent() {
    const store = useStore()
    const handleResetAll = () => {
        store.fullReset()
    }
    return <button onClick={handleResetAll} data-testid='reset-button'>Reset all</button>
}
```

### use-store.ts

The implementation of our custom hook is not as important. We are only testing if the hook was called.

```typescript
import { useState } from 'react'


export default function useStore() {
    const [store, setStore] = useState()

    const fullReset = () => {
        setStore(undefined) // example implementation, not important for our test
    }

    return {
        fullReset, // we are only testing if this method is called

        // otherMethods,
    }
}
```

## Testing

This is the code snippet that will test if the hook was called.
The most important part is to create the `fullReset` mock at the top of the file. Otherwise, Vitest will lose the reference to our mock and reinitialize it. We don't want that. The method needs to be instantiated only once. I've commented this part with `IMPORTANT`.
With `vi.mock` we can mock the implementation of our hook and assign the `fullReset` method to it. Don't forget to use the path to your custom hook that you want to replace with this mock.
Within `beforeEach` we are doing cleanup. You don't want to keep your mock forever; you want to restore it to its original form.

Finally, you can test it in a very straightforward way: render the component, click the button, and check if your mock was called.
You can initialize the original hook (first example), because it's mocked anyway, or you can test against the mock directly (second example). I prefer the first one; it's a bit more explicit and tests if the hook was mocked properly.

### my-component.test.tsx

```typescript
import { render, screen  } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, vi } from 'vitest'

import MyComponent from './my-component.tsx'
import { useStore } from './use-store'

// Mock must be at top level, to preserve reference: IMPORTANT!!!
const mockFullReset = vi.fn()

describe(`Reset store after clicking button`, () => {
	vi.mock('./use-store', () => ({ // path to file with our hook
		useStore: () => ({
            fullReset: mockFullReset,
		}),
	}))

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('calls reset functions when reset button clicked', async () => {
		render(<MyComponent />)
		await userEvent.click(screen.getByTestId('reset-button'))
		const store = useStore() // optional, check "alternative test implementation" bellow
		expect(store.mockFullReset).toBeCalled()
	})

	it('calls reset functions when reset button clicked (alternative test implementation)', async () => {
		render(<MyComponent />)
		await userEvent.click(screen.getByTestId('reset-button'))
		expect(mockFullReset).toBeCalled()
	})
})
```

And that's it! This code snippet can be useful in many scenarios. You don't want to test hook implementation this way, but mocking it is perfectly fine and often desirable.
