// This is a test file to demonstrate the pre-commit hook
import React, { useState } from 'react';

// Missing React import but using JSX

const TestComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default TestComponent;
