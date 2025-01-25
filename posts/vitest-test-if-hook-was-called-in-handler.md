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

Testing FE is not easy. You trying to run browser code in node environment. What can go wrong?
In this use case I'll show you how to test if hook was called inside component.


## Component and Hook

Our MVP example has 3 files. `use-store.ts`, `my-component.tsx` and `my-component.test.tsx`.
I'm using `vitest` with `@testing-library/react` and `@testing-library/user-event`


### my-component.tsx

This is our minimal component. All it does is showing a button, that triggers `fullReset` method from `useStore()` hook after it's clicked.

```typescript
export default function MyComponent() {
    const store = useStore()
    const handleResetAll = () => {
        store.fullReset()
    }
    return <Button onClick={handleResetAll} data-testid='reset-button'>Reset all</Button>
}
```

### use-store.ts

Implementation of our custom hook is not as important. We are only testing if hook was called.

```typescript
import { useState } from 'react'


export default function useStore() {
    const [store, setStore] = useState()

    const fullReset = () => {
        setStore(undefined) // example of implementation, not as important in our example
    }

    return {
        fullReset, // we testing only this method to be called

        otherMethods,
    }
}
```

## Testing

This is code snippet that will test if hook was called.
Most important part is to create `fullReset` mock at the top of the file. Otherwise, vitest will lose reference to our mock and reinitialise. We don't want it. Method need to be instantiated only once. I've commented this part with `IMPORTATNT`
With `vi.mock` we can mock implementation of our hook, and assign to it method `fullReset`. Don't forget to use path to your custom hook that you want to replace with this mock.
Withing `beforeEach` we are doing cleanup. You don't want to keep your mock forever, you want to restore it to original form.

Finally you can test it in very straightforward way. Render component, click the button and check if your mock was called.
You can initialise original hook (first example), because it's mocked anyway, or you can test against mock (second example). I prefer first one, it's bit more explicit and testing if hook was mocked properly.

### my-component.test.tsx

```typescript
import { render, screen  } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, vi } from 'vitest'

import MyComponent from './my-component.tsx'
import { useStore } from './use-store'

// Mock must be at top level, to preserve reference: IMPORTANT!!!
const fullReset = vi.fn()

describe(`Reset store after clicking button`, () => {
	vi.mock('./use-store', () => ({ // path to file with our hook
		useStore: () => ({
			fullReset,
		}),
	}))

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('calls reset functions when reset button clicked', async () => {
		render(<MyComponent />)
		await userEvent.click(screen.getByTestId('reset-button'))
		const store = useStore() // optional, check "alternative test implementation" bellow
		expect(store.fullReset).toBeCalled()
	})

	it('calls reset functions when reset button clicked (alternative test implementation)', async () => {
		render(<MyComponent />)
		await userEvent.click(screen.getByTestId('reset-button'))
		expect(fullReset).toBeCalled()
	})
})
```


And that's it! This code snippet can be useful in many scenarios. You don't want to test hook implementation this way, but mocking it is perfectly fine and desirable.


